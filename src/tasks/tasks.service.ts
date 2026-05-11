import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'

import { Task, User } from '@generated/client'

import { PrismaService } from '@/prisma/prisma.service'

import { CreateTaskRequestDto, UpdateTaskRequestDto } from './dto'

@Injectable()
export class TasksService {
	constructor(private readonly prisma: PrismaService) {}

	async findByProject(projectId: string): Promise<Task[]> {
		return await this.prisma.task.findMany({
			where: {
				inProjectId: projectId
			}
		})
	}

	async create(payload: CreateTaskRequestDto): Promise<Task> {
		return await this.prisma.task.create({
			data: {
				expiresAt: payload.expiresAt,
				assignee: {
					connect: {
						id: payload.assigneeId
					}
				},
				creator: {
					connect: {
						id: payload.creatorId
					}
				},
				text: payload.text,
				inProject: {
					connect: {
						id: payload.inProjectId
					}
				},
				description: payload.description,
				priority: payload.priority,
				status: payload.status,
				title: payload.title
			}
		})
	}

	async update(taskId: string, payload: UpdateTaskRequestDto, user: User): Promise<Task> {
		await this.checkAccess(user, taskId)

		return await this.prisma.task.update({
			where: {
				id: taskId
			},
			data: {
				...(payload.assigneeId && {
					assignee: {
						connect: {
							id: payload.assigneeId
						}
					}
				}),
				expiresAt: payload.expiresAt,
				description: payload.description,
				priority: payload.priority,
				status: payload.status,
				text: payload.text,
				title: payload.title
			}
		})
	}

	async delete(taskId: string, user: User): Promise<Task> {
		await this.checkAccess(user, taskId)

		return await this.prisma.task.delete({
			where: {
				id: taskId
			}
		})
	}

	async checkAccess(user: User, taskId: string): Promise<void> {
		if (user.role === 'ADMIN') return

		const task = await this.prisma.task.findUnique({
			where: {
				id: taskId
			},
			select: {
				inProject: {
					select: {
						group: {
							select: {
								ownerId: true,
								members: {
									where: {
										userId: user.id
									},
									select: {
										userId: true
									}
								}
							}
						}
					}
				}
			}
		})

		if (!task) throw new NotFoundException(`Task with this ID: #${taskId} is not found`)

		const isMember = task.inProject.group.members.length > 0
		const isOwner = task.inProject.group.ownerId === user.id

		if (!isMember && !isOwner)
			throw new ForbiddenException('You are not allowed to update this resource')
	}
}
