import { PrismaClient } from "@prisma/client"
import { join } from "path"
import { existsSync } from "fs"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function getDatabaseUrl(): string {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL
  const dbPath = join(process.cwd(), "prisma", "dev.db")
  return `file:${dbPath}`
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasourceUrl: getDatabaseUrl(),
})

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
