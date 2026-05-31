import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'

import { createClient } from 'redis'

@Module({
	imports: [ConfigModule],
	providers: [
		{
			provide: 'REDIS_CLIENT',
			useFactory: async (configService: ConfigService) => {
				const client = createClient({ url: configService.getOrThrow<string>('REDIS_URI') })

				client.on('error', err => {
					console.error('Redis error:', err)
				})

				await client.connect()

				return client
			},
			inject: [ConfigService]
		}
	],
	exports: ['REDIS_CLIENT']
})
export class RedisModule {}
