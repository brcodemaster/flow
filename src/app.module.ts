import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { PrismaModule } from './prisma/prisma.module';
import { JwtModule } from './jwt/jwt.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { GroupModule } from './group/group.module';
import { ProjectModule } from './project/project.module';
import { TasksModule } from './tasks/tasks.module';
import { ProfileModule } from './profile/profile.module';

@Module({
	imports: [ConfigModule.forRoot({ isGlobal: true, expandVariables: true }), PrismaModule, JwtModule, UserModule, AuthModule, GroupModule, ProjectModule, TasksModule, ProfileModule]
})
export class AppModule {}
