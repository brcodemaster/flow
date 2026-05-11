import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv-expand/config'

const connectionString = process.env.DATABASE_URL

export const adapter = new PrismaPg({ connectionString })
