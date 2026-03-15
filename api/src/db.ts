import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set')
}

// Pass the connection string directly — PrismaPg creates its own pool
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })

// Singleton pattern – one shared instance
const prisma = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === 'development' ? ['query', 'warn', 'error'] : ['error'],
})

export default prisma
