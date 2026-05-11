import {
	ValidationArguments,
	ValidatorConstraint,
	ValidatorConstraintInterface
} from 'class-validator'

import { CreateUserRequestDto } from '@/user/dto'

@ValidatorConstraint({ name: 'IsPasswordsMatching', async: false })
export class IsPasswordsMatchingConstraint implements ValidatorConstraintInterface {
	validate(passwordRepeat: string, validationArguments?: ValidationArguments): boolean {
		const payload = validationArguments?.object as CreateUserRequestDto

		return payload.password === passwordRepeat
	}

	defaultMessage(validationArguments?: ValidationArguments): string {
		return 'Passwords do not match'
	}
}
