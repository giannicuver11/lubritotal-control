"use server"

import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { Prisma } from "@prisma/client"
import { vehicleSchema } from "@/lib/validations"

export async function getVehicles(search?: string, clientId?: string) {
  try {
    const where: Prisma.VehicleWhereInput = {}
    if (search) {
      where.OR = [
        { plate: { contains: search,  } },
        { brand: { contains: search,  } },
        { model: { contains: search,  } },
      ]
    }
    if (clientId) where.clientId = clientId

    return await prisma.vehicle.findMany({
      where,
      include: { client: true },
      orderBy: { plate: "asc" },
    })
  } catch (error) {
    return { error: "Error al obtener vehículos" }
  }
}

export async function getVehicle(id: string) {
  try {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      include: { client: true, workOrders: { include: { parts: { include: { product: true } } }, orderBy: { createdAt: "desc" } } },
    })
    if (!vehicle) return { error: "Vehículo no encontrado" }
    return vehicle
  } catch (error) {
    return { error: "Error al obtener vehículo" }
  }
}

export async function createVehicle(data: z.infer<typeof vehicleSchema>) {
  try {
    const parsed = vehicleSchema.parse(data)
    const vehicle = await prisma.vehicle.create({ data: parsed })
    revalidatePath("/dashboard/vehicles")
    return vehicle
  } catch (error) {
    if (error instanceof z.ZodError) return { error: "Datos inválidos" }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") return { error: "La patente ya existe" }
    }
    return { error: "Error al crear vehículo" }
  }
}

export async function updateVehicle(id: string, data: Partial<z.infer<typeof vehicleSchema>>) {
  try {
    const vehicle = await prisma.vehicle.update({ where: { id }, data })
    revalidatePath("/dashboard/vehicles")
    return vehicle
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") return { error: "La patente ya existe" }
      if (error.code === "P2025") return { error: "Vehículo no encontrado" }
    }
    return { error: "Error al actualizar vehículo" }
  }
}

export async function getVehicleByPlate(plate: string) {
  try {
    const vehicle = await prisma.vehicle.findUnique({
      where: { plate },
      include: { client: true },
    })
    if (!vehicle) return { error: "Vehículo no encontrado" }
    return vehicle
  } catch (error) {
    return { error: "Error al buscar vehículo" }
  }
}

