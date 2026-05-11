import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common'

import { Authorization } from '@/common/decorators'
import { apiSuccessResponse } from '@/common/utils/api-responses'

import { CreateUserRequestDto, UpdateUserRequestDto } from './dto'
import { UserService } from './user.service'

@Authorization('ADMIN')
@Controller('users')
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Get()
	async findAll() {
		const users = await this.userService.findAll()

		const safeUsers = users.map(({ password, ...safeUser }) => safeUser)

		return apiSuccessResponse(safeUsers, 'Users returned successfully')
	}

	@Post()
	async create(@Body() payload: CreateUserRequestDto) {
		const { password, ...safeUser } = await this.userService.create(payload)

		return apiSuccessResponse(safeUser, 'User created successfully')
	}

	@Patch(':id')
	async update(@Param('id') userId: string, @Body() payload: UpdateUserRequestDto) {
		const { password, ...safeUser } = await this.userService.update(userId, payload)

		return apiSuccessResponse(safeUser, 'User updated successfully')
	}

	@Delete(':id')
	async delete(@Param('id') userId: string) {
		const { password, ...safeUser } = await this.userService.delete(userId)

		return apiSuccessResponse(safeUser, 'User deleted successfully')
	}

	@Get(':id')
	async findOne(@Param('id') id: string) {
		const { password, ...safeUser } = await this.userService.findById(id)

		return apiSuccessResponse(safeUser, 'User returned successfully')
	}
}
