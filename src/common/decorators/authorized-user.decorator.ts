import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common'

import { User } from '@generated/client'
import { type Request } from 'express'

export const AuthorizedUser = createParamDecorator((data: keyof User, ctx: ExecutionContext) => {
	const { user } = ctx.switchToHttp().getRequest() as Request

	if (!user)
		throw new UnauthorizedException(
			'Authentication required. Please sign in to access this resource'
		)

	return data ? user[data] : user
})
