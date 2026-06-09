import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function getDatabaseUrl(): string {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL
  const { join, resolve } = require("path") as typeof import("path")
  const { existsSync } = require("fs") as typeof import("fs")
  const cwd = process.cwd()
  const candidates = [
    join(cwd, "prisma", "dev.db"),
    join(cwd, "..", "prisma", "dev.db"),
    join(cwd, "..", "..", "prisma", "dev.db"),
  ]
  for (const p of candidates) {
    if (existsSync(p)) return `file:${resolve(p)}`
  }
  return `file:${resolve(join(cwd, "prisma", "dev.db"))}`
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasourceUrl: getDatabaseUrl(),
})

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
