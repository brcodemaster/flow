import { ConflictException, Injectable, NotFoundException } from '@nestjs/common'

import { User } from '@generated/client'
import { hash } from 'bcrypt'

import { PrismaService } from '@/prisma/prisma.service'

import { CreateUserRequestDto, UpdateUserRequestDto } from './dto'

@Injectable()
export class UserService {
	constructor(private readonly prisma: PrismaService) {}

	async findByEmail(email: string): Promise<User | null> {
		return await this.prisma.user.findUnique({
			where: {
				email
			}
		})
	}

	async findById(id: string): Promise<User> {
		const user = await this.prisma.user.findUnique({
			where: {
				id
			}
		})

		if (!user) throw new NotFoundException(`User with this ID: #${id} is not found`)

		return user
	}

	async findAll(): Promise<User[]> {
		return await this.prisma.user.findMany()
	}

	async update(id: string, payload: UpdateUserRequestDto): Promise<User> {
		const { password } = await this.findById(id)

		const hashedPass = payload.password ? await hash(payload.password, 10) : password

		if (payload.email) {
			const existingUser = await this.findByEmail(payload.email)

			if (existingUser)
				throw new ConflictException(
					`User with this email is already exists please change email`
				)
		}

		return await this.prisma.user.update({
			where: {
				id
			},
			data: { ...payload, password: hashedPass }
		})
	}

	async delete(taskId: string): Promise<User> {
		return await this.prisma.user.delete({
			where: {
				id: taskId
			}
		})
	}

	async create(payload: CreateUserRequestDto): Promise<User> {
		const existingUser = await this.findByEmail(payload.email)

		if (existingUser)
			throw new ConflictException(`User with this email "${payload.email}" is already exists`)

		const hashedPass = await hash(payload.password, 10)

		return await this.prisma.user.create({
			data: { ...payload, password: hashedPass }
		})
	}
}
