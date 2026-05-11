import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'

import cookieParser from 'cookie-parser'

import { AppModule } from './app.module'

async function bootstrap() {
	const app = await NestFactory.create(AppModule)

	const configService = app.get(ConfigService)

	app.use(cookieParser(configService.getOrThrow<string>('COOKIE_SECRET')))

	const origins = configService.getOrThrow<string>('ALLOWED_ORIGINS').trim().split(',')

	app.enableCors({
		origin: origins,
		credentials: true,
		exposedHeaders: ['set-cookie']
	})

	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			forbidNonWhitelisted: true,
			transform: true
		})
	)

	await app.listen(configService.getOrThrow<number>('APP_PORT'))
}
bootstrap()
