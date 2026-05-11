import { Module } from '@nestjs/common'

import { UserModule } from '@/user/user.module'

import { ProjectController } from './project.controller'
import { ProjectService } from './project.service'

@Module({
	controllers: [ProjectController],
	providers: [ProjectService],
	imports: [UserModule]
})
export class ProjectModule {}
