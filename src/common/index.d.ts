import { User } from '@generated/client'
import 'express'

declare module 'express' {
	interface Request {
		user?: User
	}
}
