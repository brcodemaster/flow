import { Injectable, NotFoundException } from '@nestjs/common'

import { UserGetPayload } from '@generated/models'

import { PrismaService } from '@/prisma/prisma.service'
import { UpdateUserRequestDto } from '@/user/dto'
import { UserService } from '@/user/user.service'

@Injectable()
export class ProfileService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly userService: UserService
	) {}

	async update(userId: string, payload: UpdateUserRequestDto) {
		return await this.userService.update(userId, payload)
	}

	async delete(userId: string) {
		return await this.userService.delete(userId)
	}

	async getMe(userId: string): Promise<
		UserGetPayload<{
			include: {
				assignedTasks: true
				avatar: true
				badges: true
				createdGroups: true
				createdTasks: true
				inGroups: true
				notifications: true
				skills: true
			}
		}>
	> {
		const user = await this.prisma.user.findUnique({
			where: {
				id: userId
			},
			include: {
				assignedTasks: true,
				avatar: true,
				badges: true,
				createdGroups: true,
				createdTasks: true,
				inGroups: true,
				notifications: true,
				skills: true
			}
		})

		if (!user) throw new NotFoundException(`There is no user with this ID: #${userId}`)

		return user
	}
}
