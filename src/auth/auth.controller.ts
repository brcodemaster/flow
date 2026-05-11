import { Body, Controller, HttpCode, HttpStatus, Post, Req, Res } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

import { type Request, type Response } from 'express'
import ms from 'ms'

import { apiSuccessResponse } from '@/common/utils/api-responses'

import { AuthService } from './auth.service'
import { LoginRequestDto, RegisterRequestDto } from './dto'

@Controller('auth')
export class AuthController {
	constructor(
		private readonly authService: AuthService,
		private readonly configService: ConfigService
	) {}

	private setCookie(res: Response, token: string) {
		res.cookie('x-refresh-token', token, {
			maxAge: ms('7d'),
			httpOnly: true,
			secure: this.configService.get<string>('NODE_ENV') === 'production',
			path: '/', // ИСПРАВИТЬ В ПРОДАКШНЕ ИЗМЕНИТЬ НА /auth
			sameSite: 'lax'
		})
	}

	@Post('sign-in')
	@HttpCode(HttpStatus.OK)
	async logIn(@Body() payload: LoginRequestDto, @Res({ passthrough: true }) res: Response) {
		const { accessToken, refreshToken, user } = await this.authService.logIn(payload)

		const { password, ...safeUser } = user

		this.setCookie(res, refreshToken)

		return apiSuccessResponse({ ...safeUser, accessToken }, 'User logged successfully')
	}

	@Post('sign-out')
	@HttpCode(HttpStatus.OK)
	async logOut(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
		const accessToken = req.headers.authorization || ''

		await this.authService.logOut(accessToken.replace('Bearer ', ''))

		res.clearCookie('x-refresh-token', { path: '/auth' })

		return apiSuccessResponse(null, 'User logged out successfully')
	}

	@Post('register')
	@HttpCode(HttpStatus.CREATED)
	async register(@Body() payload: RegisterRequestDto, @Res({ passthrough: true }) res: Response) {
		const { accessToken, refreshToken, user } = await this.authService.register(payload)

		const { password, ...safeUser } = user

		this.setCookie(res, refreshToken)

		return apiSuccessResponse({ ...safeUser, accessToken }, 'User created successfully')
	}

	@Post('refresh')
	@HttpCode(HttpStatus.OK)
	async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
		const refreshToken = req.cookies['x-refresh-token']

		const { accessToken, refreshToken: newRefreshToken } =
			await this.authService.refresh(refreshToken)

		this.setCookie(res, newRefreshToken)

		return apiSuccessResponse({ accessToken }, 'Token updated successfully')
	}
}
