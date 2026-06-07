"use server"

import { prisma } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth-utils"

export async function createAuditLog(action: string, entity?: string, entityId?: string, description?: string) {
  try {
    const user = await getCurrentUser()
    if (!user) return { error: "No autorizado" }

    return await prisma.auditLog.create({
      data: {
        userId: user.id,
        action,
        entity,
        entityId,
        description,
      },
    })
  } catch (error) {
    return { error: "Error al crear registro de auditoría" }
  }
}

