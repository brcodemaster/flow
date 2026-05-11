import { Global, Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule as JwtConfigModule } from '@nestjs/jwt'

@Global()
@Module({
	imports: [
		JwtConfigModule.registerAsync({
			imports: [ConfigModule],
			useFactory: async (config: ConfigService) => ({
				secret: config.getOrThrow<string>('JWT_SECRET')
			}),
			inject: [ConfigService]
		})
	],
	exports: [JwtConfigModule]
})
export class JwtModule {}
