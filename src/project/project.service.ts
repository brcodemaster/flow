import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'

import { Project, User } from '@generated/client'

import { PrismaService } from '@/prisma/prisma.service'

import { CreateProjectRequestDto, UpdateProjectRequestDto } from './dto'

@Injectable()
export class ProjectService {
	constructor(private readonly prisma: PrismaService) {}

	async findAll(): Promise<Project[]> {
		return await this.prisma.project.findMany()
	}

	async findMine(userId: string): Promise<Project[]> {
		return await this.prisma.project.findMany({
			where: {
				group: {
					members: {
						some: {
							id: userId
						}
					}
				}
			}
		})
	}

	async findByName(name: string): Promise<Project | null> {
		return await this.prisma.project.findFirst({
			where: { name: { contains: name, mode: 'insensitive' } }
		})
	}

	async findById(projectId: string): Promise<Project> {
		const project = await this.prisma.project.findUnique({
			where: {
				id: projectId
			}
		})

		if (!project) throw new NotFoundException(`There is no project with this ID: #${projectId}`)

		return project
	}

	async create(payload: CreateProjectRequestDto): Promise<Project> {
		return await this.prisma.project.create({
			data: {
				name: payload.name,
				group: { connect: { id: payload.groupId } },
				isPublic: payload.isPublic
			}
		})
	}

	async delete(projectId: string, user: User): Promise<Project> {
		await this.checkAccess(user, projectId)

		return await this.prisma.project.delete({ where: { id: projectId } })
	}

	async update(
		projectId: string,
		payload: UpdateProjectRequestDto,
		user: User
	): Promise<Project> {
		await this.checkAccess(user, projectId)

		return await this.prisma.project.update({
			where: {
				id: projectId
			},
			data: {
				isPublic: payload.isPublic,
				name: payload.name
			}
		})
	}

	async checkAccess(user: User, projectId: string): Promise<void> {
		if (user.role === 'ADMIN') return

		const project = await this.prisma.project.findUnique({
			where: {
				id: projectId
			},
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
		})

		if (!project)
			throw new NotFoundException(`Project with this ID: #${projectId} is not found`)

		const isMember = project.group.members.length > 0
		const isOwner = project.group.ownerId === user.id

		if (!isMember && !isOwner)
			throw new ForbiddenException('You are not allowed to update this resource')
	}
}
