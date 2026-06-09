import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function getDatabaseUrl(): string {
  if (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith("file:")) {
    return process.env.DATABASE_URL
  }
  try {
    const { join, resolve } = require("path")
    const { existsSync } = require("fs")
    const cwd = process.cwd()
    const candidates = [
      join(cwd, "dev.db"),
      join(cwd, "prisma", "dev.db"),
      join(cwd, ".next", "prisma", "dev.db"),
      join(cwd, "..", "dev.db"),
      join(cwd, "..", "prisma", "dev.db"),
      join(cwd, "..", ".next", "prisma", "dev.db"),
    ]
    for (const p of candidates) {
      if (existsSync(p)) return `file:${resolve(p)}`
    }
  } catch {}
  return "file:./dev.db"
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasourceUrl: getDatabaseUrl(),
})

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
