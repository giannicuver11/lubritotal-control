"use server"

import { prisma } from "@/lib/db"
import { getCurrentUser, requireAuth } from "@/lib/auth-utils"
import { revalidatePath } from "next/cache"
import { Prisma } from "@prisma/client"
import { workOrderSchema } from "@/lib/validations"
import { z } from "zod"

export async function getWorkOrders(status?: string) {
  try {
    const where: Prisma.WorkOrderWhereInput = {}
    if (status) where.status = status as any

    return await prisma.workOrder.findMany({
      where,
      include: { client: true, vehicle: true, user: { select: { id: true, name: true } }, parts: { include: { product: true } } },
      orderBy: { createdAt: "desc" },
    })
  } catch (error) {
    return { error: "Error al obtener órdenes de trabajo" }
  }
}

export async function getWorkOrder(id: string) {
  try {
    const order = await prisma.workOrder.findUnique({
      where: { id },
      include: { client: true, vehicle: true, user: { select: { id: true, name: true } }, parts: { include: { product: true } } },
    })
    if (!order) return { error: "Orden de trabajo no encontrada" }
    return order
  } catch (error) {
    return { error: "Error al obtener orden de trabajo" }
  }
}

export async function createWorkOrder(data: z.infer<typeof workOrderSchema>) {
  try {
    await requireAuth()
    const user = await getCurrentUser()
    if (!user) return { error: "No autorizado" }

    const parsed = workOrderSchema.parse(data)
    const order = await prisma.workOrder.create({
      data: {
        ...parsed,
        userId: user.id,
        total: parsed.laborCost || 0,
      },
      include: { client: true, vehicle: true, parts: true },
    })

    revalidatePath("/dashboard/orders")
    return order
  } catch (error) {
    if (error instanceof z.ZodError) return { error: "Datos inválidos" }
    return { error: "Error al crear orden de trabajo" }
  }
}

export async function updateWorkOrder(id: string, data: Partial<z.infer<typeof workOrderSchema>>) {
  try {
    const parsed = workOrderSchema.partial().parse(data)
    const partsTotal = await prisma.workOrderPart.aggregate({
      where: { workOrderId: id },
      _sum: { subtotal: true },
    })
    const laborCost = parsed.laborCost ?? 0
    const total = Number(laborCost) + Number(partsTotal._sum.subtotal || 0)

    const order = await prisma.workOrder.update({
      where: { id },
      data: { ...parsed, total },
    })

    revalidatePath("/dashboard/orders")
    return order
  } catch (error) {
    if (error instanceof z.ZodError) return { error: "Datos inválidos" }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") return { error: "Orden de trabajo no encontrada" }
    }
    return { error: "Error al actualizar orden de trabajo" }
  }
}

export async function addPartToOrder(orderId: string, productId: string, quantity: number, price: number) {
  try {
    const subtotal = quantity * price
    const part = await prisma.workOrderPart.create({
      data: { workOrderId: orderId, productId, quantity, price, subtotal },
    })
    await _recalcOrderTotal(orderId)

    revalidatePath("/dashboard/orders")
    return part
  } catch (error) {
    return { error: "Error al agregar repuesto" }
  }
}

export async function removePartFromOrder(partId: string) {
  try {
    const part = await prisma.workOrderPart.findUnique({ where: { id: partId } })
    if (!part) return { error: "Repuesto no encontrado" }

    await prisma.workOrderPart.delete({ where: { id: partId } })
    await _recalcOrderTotal(part.workOrderId)

    revalidatePath("/dashboard/orders")
    return { success: true }
  } catch (error) {
    return { error: "Error al eliminar repuesto" }
  }
}

async function _recalcOrderTotal(orderId: string) {
  const order = await prisma.workOrder.findUnique({ where: { id: orderId }, select: { laborCost: true } })
  if (!order) return
  const partsTotal = await prisma.workOrderPart.aggregate({
    where: { workOrderId: orderId },
    _sum: { subtotal: true },
  })
  const total = Number(order.laborCost) + Number(partsTotal._sum.subtotal || 0)
  await prisma.workOrder.update({ where: { id: orderId }, data: { total } })
}

