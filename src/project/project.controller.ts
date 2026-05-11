import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common'

import { type User } from '@generated/client'

import { Authorization, AuthorizedUser } from '@/common/decorators'
import { apiSuccessResponse } from '@/common/utils/api-responses'

import { CreateProjectRequestDto, UpdateProjectRequestDto } from './dto'
import { ProjectService } from './project.service'

@Authorization()
@Controller('projects')
export class ProjectController {
	constructor(private readonly projectService: ProjectService) {}

	@Authorization('ADMIN')
	@Get()
	async findAll() {
		const projects = await this.projectService.findAll()

		return apiSuccessResponse(projects, 'projects returned successfully')
	}

	@Get('mine')
	async findMine(@AuthorizedUser('id') userId: string) {
		const projects = await this.projectService.findMine(userId)

		return apiSuccessResponse(projects, 'projects returned successfully')
	}

	@Post()
	async create(@Body() payload: CreateProjectRequestDto) {
		const project = await this.projectService.create(payload)

		return apiSuccessResponse(project, 'Project created successfully')
	}

	@Patch(':id')
	async update(
		@Param('id') projectId: string,
		@Body() payload: UpdateProjectRequestDto,
		@AuthorizedUser() user: User
	) {
		const project = await this.projectService.update(projectId, payload, user)

		return apiSuccessResponse(project, 'Project updated successfully')
	}

	@Delete(':id')
	async delete(@Param('id') projectId: string, @AuthorizedUser() user: User) {
		const project = await this.projectService.delete(projectId, user)

		return apiSuccessResponse(project, 'Project deleted successfully')
	}

	@Authorization('ADMIN')
	@Get(':id')
	async findById(@Param('id') projectId: string) {
		const project = await this.projectService.findById(projectId)

		return apiSuccessResponse(project, 'Project returned successfully')
	}
}
