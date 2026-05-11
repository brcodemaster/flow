import { UserRole } from '@generated/enums'

export type TApiResponse<T extends unknown> = {
	success: boolean
	message: string
	data: T
}

export type TJwtPayload = { sub: string; role: UserRole; iat: number; exp: number }
