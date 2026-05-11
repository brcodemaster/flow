import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common'

import { type User } from '@generated/client'

import { Authorization, AuthorizedUser } from '@/common/decorators'
import { apiSuccessResponse } from '@/common/utils/api-responses'

import { CreateGroupRequestDto, UpdateGroupRequest } from './dto'
import { GroupService } from './group.service'

@Authorization()
@Controller('groups')
export class GroupController {
	constructor(private readonly groupService: GroupService) {}

	@Authorization('ADMIN')
	@Get()
	async findAll() {
		const groups = await this.groupService.findAll()

		return apiSuccessResponse(groups, 'Groups returned successfully')
	}

	@Get('mine')
	async findMine(@AuthorizedUser('id') userId: string) {
		const groups = await this.groupService.findMine(userId)

		return apiSuccessResponse(groups, 'Groups returned successfully')
	}

	@Get('search')
	async findByName(@Query('group') groupName: string) {
		const groups = await this.groupService.findByName(groupName)

		return apiSuccessResponse(groups, 'Groups returned successfully')
	}

	@Post()
	async create(@Body() payload: CreateGroupRequestDto) {
		console.log('From controller group POST')

		const group = await this.groupService.create(payload)

		return apiSuccessResponse(group, 'Group created successfully')
	}

	@Delete(':id')
	async delete(@Param('id') groupId: string, @AuthorizedUser() user: User) {
		const group = await this.groupService.delete(groupId, user)

		return apiSuccessResponse(group, 'Group deleted successfully')
	}

	@Patch(':id')
	async update(
		@Param('id') groupId: string,
		@Body() payload: UpdateGroupRequest,
		@AuthorizedUser() user: User
	) {
		const group = await this.groupService.update(groupId, payload, user)

		return apiSuccessResponse(group, 'Group updated successfully')
	}

	@Authorization('ADMIN')
	@Get(':id')
	async findById(@Param('id') groupId: string) {
		const group = await this.groupService.findById(groupId)

		return apiSuccessResponse(group, 'Group returned successfully')
	}
}
