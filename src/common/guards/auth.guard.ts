import {
	CanActivate,
	ExecutionContext,
	Injectable,
	NotFoundException,
	UnauthorizedException
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

import { type Request } from 'express'

import { UserService } from '@/user/user.service'

import { TJwtPayload } from '../types'

@Injectable()
export class AuthGuard implements CanActivate {
	constructor(
		private readonly userService: UserService,
		private readonly jwtService: JwtService
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const req = context.switchToHttp().getRequest() as Request

		const token = req.headers.authorization?.replace('Bearer ', '') || ''

		if (!token) throw new UnauthorizedException('Authentication token is missing ')

		try {
			const jwtPayload = this.jwtService.verify<TJwtPayload>(token)

			console.log('From Auth Guard: ' + jwtPayload)

			if (!jwtPayload || !jwtPayload.sub)
				throw new UnauthorizedException('Invalid token payload')

			const user = await this.userService.findById(jwtPayload.sub)

			if (!user)
				throw new NotFoundException(`There is no user with this ID: #${jwtPayload.sub}`)

			req.user = user

			return true
		} catch (error) {
			throw new UnauthorizedException('Token is invalid or expired')
		}
	}
}
