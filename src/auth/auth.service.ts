import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

import { Session, User } from '@generated/client'
import { compare } from 'bcrypt'
import ms from 'ms'
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
		private readonly prisma: PrismaService
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

	async logOut(accessToken: string): Promise<Session> {
		let payload: null | (TJwtPayload & { sessionId: string })

		try {
			payload = (await this.jwtService.verify(accessToken)) as TJwtPayload & {
				sessionId: string
			}
		} catch (error) {
			throw new UnauthorizedException('Invalid refresh token' + ' ' + error)
		}

		if (!payload) throw new UnauthorizedException()

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
		const sessionCount = await this.prisma.session.count({
			where: {
				userId: user.id
			}
		})

		if (sessionCount >= 3) {
			const session = await this.prisma.session.findFirst({
				where: {
					userId: user.id
				},
				orderBy: {
					createdAt: 'asc'
				}
			})

			if (session) {
				await this.prisma.session.delete({
					where: {
						id: session.id
					}
				})
			}
		}

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

		return { refreshToken, session, accessToken }
	}
}
