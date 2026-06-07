"use server"

import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { Prisma } from "@prisma/client"
import { clientSchema } from "@/lib/validations"

export async function getClients(search?: string) {
  try {
    const where: Prisma.ClientWhereInput = {}
    if (search) {
      where.OR = [
        { name: { contains: search,  } },
        { rut: { contains: search,  } },
        { phone: { contains: search,  } },
        { email: { contains: search,  } },
      ]
    }

    return await prisma.client.findMany({
      where,
      include: { _count: { select: { vehicles: true, sales: true, workOrders: true } } },
      orderBy: { name: "asc" },
    })
  } catch (error) {
    return { error: "Error al obtener clientes" }
  }
}

export async function getClient(id: string) {
  try {
    const client = await prisma.client.findUnique({
      where: { id },
      include: { vehicles: true },
    })
    if (!client) return { error: "Cliente no encontrado" }
    return client
  } catch (error) {
    return { error: "Error al obtener cliente" }
  }
}

export async function createClient(data: z.infer<typeof clientSchema>) {
  try {
    const parsed = clientSchema.parse(data)
    const client = await prisma.client.create({ data: parsed })
    revalidatePath("/dashboard/clients")
    return client
  } catch (error) {
    if (error instanceof z.ZodError) return { error: "Datos inválidos" }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") return { error: "El RUT ya existe" }
    }
    return { error: "Error al crear cliente" }
  }
}

export async function updateClient(id: string, data: Partial<z.infer<typeof clientSchema>>) {
  try {
    const client = await prisma.client.update({ where: { id }, data })
    revalidatePath("/dashboard/clients")
    return client
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") return { error: "El RUT ya existe" }
      if (error.code === "P2025") return { error: "Cliente no encontrado" }
    }
    return { error: "Error al actualizar cliente" }
  }
}

export async function deleteClient(id: string) {
  try {
    await prisma.client.delete({ where: { id } })
    revalidatePath("/dashboard/clients")
    return { success: true }
  } catch (error) {
    return { error: "Error al eliminar cliente" }
  }
}

