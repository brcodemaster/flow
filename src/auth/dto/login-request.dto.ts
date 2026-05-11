import { PickType } from '@nestjs/mapped-types'

import { CreateUserRequestDto } from '@/user/dto'

export class LoginRequestDto extends PickType(CreateUserRequestDto, ['email', 'password']) {}
