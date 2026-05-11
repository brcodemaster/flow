import { Module } from '@nestjs/common'

import { UserModule } from '@/user/user.module'

import { TasksController } from './tasks.controller'
import { TasksService } from './tasks.service'

@Module({
	controllers: [TasksController],
	providers: [TasksService],
	imports: [UserModule]
})
export class TasksModule {}
