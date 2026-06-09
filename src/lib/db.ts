import { PrismaClient } from "@prisma/client"
import { join } from "path"
import { existsSync } from "fs"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function getDatabaseUrl(): string {
  if (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith("file:")) {
    return process.env.DATABASE_URL
  }
  const candidates = [
    join(process.cwd(), "dev.db"),
    join(process.cwd(), "prisma", "dev.db"),
    join(__dirname, "dev.db"),
    join(__dirname, "..", "dev.db"),
  ]
  for (const p of candidates) {
    if (existsSync(p)) return `file:${p}`
  }
  return `file:${join(process.cwd(), "dev.db")}`
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasourceUrl: getDatabaseUrl(),
})

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
