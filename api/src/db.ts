import 'dotenv/config'
import path from 'path'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { PrismaClient } from '@prisma/client'

const dbUrl =
  process.env.DATABASE_URL ?? `file:${path.join(__dirname, '../../prisma/dev.db')}`

const adapter = new PrismaBetterSqlite3({ url: dbUrl })

// Singleton pattern – one shared instance
const prisma = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === 'development' ? ['query', 'warn', 'error'] : ['error'],
})

export default prisma
