import { applyDecorators, UseGuards } from '@nestjs/common'

import { UserRole } from '@generated/enums'

import { AuthGuard, RolesGuard } from '../guards'
import { Roles } from './roles.decorator'

export const Authorization = (...roles: UserRole[]) => {
	if (roles.length > 0) {
		return applyDecorators(Roles(...roles), UseGuards(AuthGuard, RolesGuard))
	}

	return applyDecorators(UseGuards(AuthGuard))
}
