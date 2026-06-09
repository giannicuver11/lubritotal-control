export const runtime = "nodejs"
export const dynamic = "force-dynamic"

import { PrismaClient } from "@prisma/client"
import { join } from "path"
import { existsSync, readdirSync } from "fs"

export async function GET() {
  const cwd = process.cwd()
  const env = {
    NODE_ENV: process.env.NODE_ENV,
    NETLIFY: process.env.NETLIFY,
    DATABASE_URL: process.env.DATABASE_URL,
    CWD: cwd,
    LAMBDA_TASK_ROOT: process.env.LAMBDA_TASK_ROOT,
  }

  const candidates = [
    join(cwd, "dev.db"),
    join(cwd, "prisma", "dev.db"),
    join(cwd, ".next", "prisma", "dev.db"),
    join(cwd, "..", "dev.db"),
    join(cwd, "..", "prisma", "dev.db"),
    join(cwd, "..", ".next", "prisma", "dev.db"),
    "/var/task/prisma/dev.db",
    "/var/task/.next/prisma/dev.db",
  ]

  const results = candidates.map((p) => ({ path: p, exists: existsSync(p) }))

  let ls: string[] = []
  try { ls = readdirSync(cwd).slice(0, 30) } catch { ls = ["error listing"] }

  return Response.json({ env, results, files: ls })
}
