import {
	CanActivate,
	ExecutionContext,
	ForbiddenException,
	Injectable,
	UnauthorizedException
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'

import { UserRole } from '@generated/enums'
import { type Request } from 'express'

import { ROLES_KEY } from '../decorators'

@Injectable()
export class RolesGuard implements CanActivate {
	constructor(private readonly reflector: Reflector) {}

	canActivate(context: ExecutionContext): boolean {
		const roles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
			context.getHandler(),
			context.getClass()
		])

		const { user } = context.switchToHttp().getRequest() as Request

		if (!roles) return true

		if (!user)
			throw new UnauthorizedException(
				'Authentication required. Please sign in to access this resource'
			)

		if (!roles.includes(user.role))
			throw new ForbiddenException('You do not have permission to access this resource')

		return true
	}
}
