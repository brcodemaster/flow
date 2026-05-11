import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common'

import { type User } from '@generated/client'

import { Authorization, AuthorizedUser } from '@/common/decorators'
import { apiSuccessResponse } from '@/common/utils/api-responses'

import { CreateTaskRequestDto, UpdateTaskRequestDto } from './dto'
import { TasksService } from './tasks.service'

@Authorization()
@Controller('tasks')
export class TasksController {
	constructor(private readonly tasksService: TasksService) {}

	@Authorization('ADMIN')
	@Get()
	async findByProject(@Query('project') projectId: string) {
		const tasks = await this.tasksService.findByProject(projectId)

		return apiSuccessResponse(tasks, 'Tasks returned successfully')
	}

	@Patch(':id')
	async update(
		@Param('id') taskId: string,
		@Body() payload: UpdateTaskRequestDto,
		@AuthorizedUser() user: User
	) {
		const task = await this.tasksService.update(taskId, payload, user)

		return apiSuccessResponse(task, 'Task updated successfully')
	}

	@Delete(':id')
	async delete(@Param('id') taskId: string, @AuthorizedUser() user: User) {
		const task = await this.tasksService.delete(taskId, user)

		return apiSuccessResponse(task, 'Task deleted successfully')
	}

	@Post()
	async create(@Body() payload: CreateTaskRequestDto) {
		const task = await this.tasksService.create(payload)

		return apiSuccessResponse(task, 'Task created successfully')
	}
}
