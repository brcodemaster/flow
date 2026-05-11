import { Module } from '@nestjs/common'

import { UserModule } from '@/user/user.module'

import { GroupController } from './group.controller'
import { GroupService } from './group.service'

@Module({
	controllers: [GroupController],
	providers: [GroupService],
	imports: [UserModule]
})
export class GroupModule {}
