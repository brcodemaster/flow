import { HttpException } from '@nestjs/common'

import { TApiResponse } from '../types'

export function apiSuccessResponse<T extends unknown>(data: T, message: string): TApiResponse<T> {
	return {
		success: true,
		message,
		data
	}
}

export function apiErrorResponse(error: unknown, errorMessage?: string): TApiResponse<null> {
	if (error instanceof HttpException) {
		return { success: false, message: errorMessage || error.message, data: null }
	}

	return { success: false, message: 'Internal server error', data: null }
}
