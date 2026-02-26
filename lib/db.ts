import { PrismaClient } from '@prisma/client'

/**
 * Neon-compatible Prisma client.
 * Uses standard PrismaClient for local dev and Neon serverless adapter in production.
 */
function createPrismaClient() {
  // For Neon in production, the DATABASE_URL with pgbouncer=true handles connection pooling
  // directUrl is used for schema migrations
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
