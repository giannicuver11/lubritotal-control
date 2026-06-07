"use server"

import { prisma } from "@/lib/db"
import { requireRole } from "@/lib/auth-utils"
import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"

export async function getUsers() {
  await requireRole("ADMIN")
  try {
    return await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, active: true, createdAt: true },
      orderBy: { name: "asc" },
    })
  } catch (error) {
    return { error: "Error al obtener usuarios" }
  }
}

export async function createUser(name: string, email: string, password: string, role: string) {
  await requireRole("ADMIN")
  try {
    const hashedPassword = await bcrypt.hash(password, 12)
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role: role as any },
    })
    revalidatePath("/configuracion")
    return { id: user.id, name: user.name, email: user.email, role: user.role, active: user.active }
  } catch (error) {
    return { error: "Error al crear usuario" }
  }
}

export async function updateUser(id: string, data: { name?: string; email?: string; password?: string; role?: string; active?: boolean }) {
  await requireRole("ADMIN")
  try {
    const updateData: any = { ...data }
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 12)
    } else {
      delete updateData.password
    }
    const user = await prisma.user.update({ where: { id }, data: updateData })
    revalidatePath("/configuracion")
    return { id: user.id, name: user.name, email: user.email, role: user.role, active: user.active }
  } catch (error) {
    return { error: "Error al actualizar usuario" }
  }
}

export async function deleteUser(id: string) {
  await requireRole("ADMIN")
  try {
    await prisma.user.delete({ where: { id } })
    revalidatePath("/configuracion")
    return { success: true }
  } catch (error) {
    return { error: "Error al eliminar usuario" }
  }
}

