import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'

import { Group, User } from '@generated/client'

import { PrismaService } from '@/prisma/prisma.service'

import { CreateGroupRequestDto, UpdateGroupRequest } from './dto'

@Injectable()
export class GroupService {
	constructor(private readonly prisma: PrismaService) {}

	async findByName(name: string): Promise<Group | null> {
		return await this.prisma.group.findFirst({
			where: {
				name: {
					contains: name,
					mode: 'insensitive'
				},
				isPublic: true
			}
		})
	}

	async findById(groupId: string): Promise<Group> {
		const group = await this.prisma.group.findUnique({
			where: {
				id: groupId
			}
		})

		if (!group) throw new NotFoundException(`Group with this ID: #${groupId} is not found`)

		return group
	}

	async findAll(): Promise<Group[]> {
		return await this.prisma.group.findMany()
	}

	async create(payload: CreateGroupRequestDto): Promise<Group> {
		console.log('From Group Service CREATE')

		return await this.prisma.group.create({
			data: {
				name: payload.name,
				owner: { connect: { id: payload.ownerId } },
				members: { create: { user: { connect: { id: payload.ownerId } } } },
				isPublic: payload.isPublic
			}
		})
	}

	async delete(groupId: string, user: User) {
		await this.checkAccess(user, groupId)

		return await this.prisma.group.delete({
			where: {
				id: groupId
			}
		})
	}

	async update(groupId: string, payload: UpdateGroupRequest, user: User): Promise<Group> {
		await this.checkAccess(user, groupId)

		return await this.prisma.group.update({
			where: {
				id: groupId
			},
			data: {
				name: payload.name,
				isPublic: payload.isPublic
			}
		})
	}

	async findMine(userId: string) {
		return await this.prisma.group.findMany({
			where: {
				members: { some: { userId } }
			}
		})
	}

	private async checkAccess(user: User, groupId: string): Promise<void> {
		if (user.role === 'ADMIN') return

		const group = await this.prisma.group.findUnique({
			where: {
				id: groupId
			},
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
		})

		if (!group) throw new NotFoundException(`Group with this ID: #${groupId} is not found`)

		const isMember = group.members.length > 0
		const isOwner = group.ownerId === user.id

		if (!isMember && !isOwner)
			throw new ForbiddenException('You are not allowed to update this resource')
	}
}
