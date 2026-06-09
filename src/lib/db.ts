import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function getDatabaseUrl(): string {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL
  return "file:./dev.db"
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasourceUrl: getDatabaseUrl(),
})

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
