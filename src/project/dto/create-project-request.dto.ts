import { Transform } from 'class-transformer'
import { IsBoolean, IsOptional, IsString, IsUUID, MinLength } from 'class-validator'

export class CreateProjectRequestDto {
	@IsString()
	@MinLength(3)
	name!: string

	@IsUUID()
	groupId!: string

	@IsOptional()
	@Transform(({ value }) => {
		if (value === 'true') return true

		if (value === 'false') return false

		return value
	})
	@IsBoolean()
	isPublic!: boolean
}
