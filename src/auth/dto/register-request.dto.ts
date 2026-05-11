import { Injectable } from '@nestjs/common'
import { OmitType } from '@nestjs/mapped-types'

import { IsNotEmpty, IsString, MinLength, Validate } from 'class-validator'

import { IsPasswordsMatchingConstraint } from '@/common/decorators'
import { CreateUserRequestDto } from '@/user/dto'

@Injectable()
export class RegisterRequestDto extends OmitType(CreateUserRequestDto, ['role']) {
	@IsNotEmpty({ message: 'Поле подтверждения пароля не может быть пустым.' })
	@IsString({ message: 'Пароль подтверждения должен быть строкой.' })
	@MinLength(6, {
		message: 'Пароль подтверждения должен содержать не менее 6 символов.'
	})
	@Validate(IsPasswordsMatchingConstraint, { message: 'Passwords do not match' })
	passwordRepeat!: string
}
