import { Body, Controller, Delete, Get, Patch } from '@nestjs/common'

import { Authorization, AuthorizedUser } from '@/common/decorators'
import { apiSuccessResponse } from '@/common/utils/api-responses'
import { UpdateUserRequestDto } from '@/user/dto'

import { ProfileService } from './profile.service'

@Authorization()
@Controller('profile')
export class ProfileController {
	constructor(private readonly profileService: ProfileService) {}

	@Get()
	async getMe(@AuthorizedUser('id') userId: string) {
		const { password, ...safeUser } = await this.profileService.getMe(userId)

		return apiSuccessResponse(safeUser, 'Profile returned successfully')
	}

	@Delete()
	async delete(@AuthorizedUser('id') userId: string) {
		const { password, ...safeUser } = await this.profileService.delete(userId)

		return apiSuccessResponse(safeUser, 'Profile deleted successfully')
	}

	@Patch()
	async update(@AuthorizedUser('id') userId: string, @Body() payload: UpdateUserRequestDto) {
		const { password, ...safeUser } = await this.profileService.update(userId, payload)

		return apiSuccessResponse(safeUser, 'Profile updated successfully')
	}
}
