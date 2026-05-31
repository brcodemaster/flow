import { ConflictException, Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

import { Session, User } from '@generated/client'
import { compare } from 'bcrypt'
import ms from 'ms'
import { type RedisClientType } from 'redis'
import { v4 as uuidV4 } from 'uuid'

import { TJwtPayload } from '@/common/types'
import { PrismaService } from '@/prisma/prisma.service'
import { UserService } from '@/user/user.service'

import { LoginRequestDto, RegisterRequestDto } from './dto'

@Injectable()
export class AuthService {
	constructor(
		private readonly userService: UserService,
		private readonly jwtService: JwtService,
		private readonly prisma: PrismaService,

		@Inject('REDIS_CLIENT')
		private readonly redis: RedisClientType
	) {}

	async logIn(payload: LoginRequestDto): Promise<{
		user: User
		accessToken: string
		refreshToken: string
		session: Session
	}> {
		const existingUser = await this.userService.findByEmail(payload.email)

		if (!existingUser)
			throw new UnauthorizedException('The provided email or password is incorrect')

		const isPasswordsMatching = await compare(payload.password, existingUser.password)

		if (!isPasswordsMatching)
			throw new UnauthorizedException('The provided email or password is incorrect')

		const { accessToken, refreshToken, session } = await this.getToken(existingUser)

		return { user: existingUser, accessToken, refreshToken, session }
	}

	async logOut(accessToken: string, refreshToken?: string): Promise<Session> {
		if (!refreshToken) throw new UnauthorizedException('Please authenticate first')

		let payload: null | (TJwtPayload & { sessionId: string })

		try {
			payload = (await this.jwtService.verify(accessToken)) as TJwtPayload & {
				sessionId: string
			}
		} catch (error) {
			throw new UnauthorizedException('Invalid access token' + ' ' + error)
		}

		if (!payload) throw new UnauthorizedException()

		await this.redis.del(`session:${refreshToken}`)

		await this.redis.lRem(`sessions:${payload.sub}`, 0, refreshToken)

		return await this.prisma.session.delete({
			where: {
				id: payload.sessionId
			}
		})
	}

	async register(payload: RegisterRequestDto): Promise<{
		user: User
		accessToken: string
		refreshToken: string
		session: Session
	}> {
		const existingUser = await this.userService.findByEmail(payload.email)

		if (existingUser)
			throw new ConflictException(`User with this email: ${payload.email} is already exists`)

		const { passwordRepeat, ...userData } = payload

		const newUser = await this.userService.create(userData)

		const { accessToken, refreshToken, session } = await this.getToken(newUser)

		return { user: newUser, accessToken, refreshToken, session }
	}

	async refresh(oldRefreshToken: string) {
		let payload: null | TJwtPayload

		try {
			payload = (await this.jwtService.verify(oldRefreshToken)) as TJwtPayload
		} catch (error) {
			throw new UnauthorizedException('Invalid refresh token')
		}

		const savedSession = await this.prisma.session.findFirst({
			where: { token: oldRefreshToken }
		})

		if (!savedSession || savedSession.expiresAt < new Date()) {
			if (savedSession) await this.prisma.session.delete({ where: { id: savedSession.id } })
			throw new UnauthorizedException('Session expired or invalid')
		}

		const user = await this.userService.findById(payload?.sub || '')
		if (!user) throw new UnauthorizedException('User not found')

		await this.prisma.session.delete({ where: { id: savedSession.id } })

		return await this.getToken(user)
	}

	private async getToken(
		user: User
	): Promise<{ refreshToken: string; session: Session; accessToken: string }> {
		const refreshToken = this.jwtService.sign(
			{ sub: user.id, role: user.role },
			{ expiresIn: '7d', jwtid: uuidV4() }
		)

		const session = await this.prisma.session.create({
			data: {
				token: refreshToken,
				expiresAt: new Date(Date.now() + ms('7d')),
				userId: user.id
			}
		})

		const accessToken = this.jwtService.sign(
			{ sub: user.id, role: user.role, sessionId: session.id },
			{ expiresIn: '15m' }
		)

		await this.redis.lPush(`sessions:${user.id}`, refreshToken)

		const tokensToDelete = await this.redis.lRange(`sessions:${user.id}`, 3, -1)

		await this.redis.lTrim(`sessions:${user.id}`, 0, 2)

		if (tokensToDelete.length > 0) {
			for (const token of tokensToDelete) {
				await this.redis.del(`session:${token}`)
				await this.prisma.session.deleteMany({ where: { token } })
			}
		}

		await this.redis.set(
			`session:${refreshToken}`,
			JSON.stringify({
				userId: user.id,
				sessionId: session.id
			}),
			{ EX: 60 * 60 * 24 * 7 }
		)

		return { refreshToken, session, accessToken }
	}
}
