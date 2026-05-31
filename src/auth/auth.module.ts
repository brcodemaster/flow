import { Module } from '@nestjs/common'

import { RedisModule } from '@/redis/redis.module'
import { UserModule } from '@/user/user.module'

import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'

@Module({
	controllers: [AuthController],
	providers: [AuthService],
	imports: [UserModule, RedisModule]
})
export class AuthModule {}
