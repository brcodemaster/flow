import { PartialType } from '@nestjs/mapped-types'

import { CreateGroupRequestDto } from './create-group-request.dto'

export class UpdateGroupRequest extends PartialType(CreateGroupRequestDto) {}
