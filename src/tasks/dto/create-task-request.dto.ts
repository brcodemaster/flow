import { TaskPriority, TaskStatus } from '@generated/enums'
import { Type } from 'class-transformer'
import { IsDate, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator'

export class CreateTaskRequestDto {
	@IsDate()
	@Type(() => Date)
	expiresAt!: Date

	@IsUUID()
	assigneeId!: string

	@IsUUID()
	creatorId!: string

	@IsString()
	text!: string

	@IsUUID()
	inProjectId!: string

	@IsOptional()
	@IsString()
	description?: string

	@IsOptional()
	@IsString()
	title?: string

	@IsOptional()
	@IsEnum(TaskPriority)
	priority?: TaskPriority

	@IsOptional()
	@IsEnum(TaskStatus)
	status?: TaskStatus
}
