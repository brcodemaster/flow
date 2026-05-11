import { UserRole } from '@generated/enums'
import {
	IsEmail,
	IsEnum,
	IsNotEmpty,
	IsOptional,
	IsString,
	Matches,
	MinLength
} from 'class-validator'

export class CreateUserRequestDto {
	@IsString({ message: 'Name must be a string' })
	@IsNotEmpty({ message: 'Name is required' })
	readonly name!: string

	@IsString({ message: 'Last name must be a string' })
	@IsOptional()
	readonly lastName?: string

	@IsString({ message: 'Username must be a string' })
	@IsNotEmpty({ message: 'Username is required' })
	@MinLength(3, { message: 'Username must be at least 3 characters long' })
	readonly userName!: string

	@IsEmail({}, { message: 'Invalid email format' })
	@IsNotEmpty({ message: 'Email is required' })
	readonly email!: string

	@IsEnum(UserRole, { message: 'Invalid user role' })
	@IsOptional()
	readonly role?: UserRole

	@IsNotEmpty({ message: 'Password is required.' })
	@IsString({ message: 'Password must be a string.' })
	@Matches(/^(?=.*[A-Z])(?=.*\d).{3,}$/, {
		message:
			'Password must be at least 3 characters long, contain at least one uppercase letter and one number'
	})
	@MinLength(6, { message: 'Password must be at least 6 characters long.' })
	readonly password!: string
}
