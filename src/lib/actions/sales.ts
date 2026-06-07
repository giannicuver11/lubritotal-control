"use server"

import { prisma } from "@/lib/db"
import { getCurrentUser, requireAuth } from "@/lib/auth-utils"
import { revalidatePath } from "next/cache"
import { Prisma } from "@prisma/client"

export async function getSales(from?: Date, to?: Date) {
  try {
    const where: Prisma.SaleWhereInput = {}
    if (from || to) {
      where.createdAt = {}
      if (from) where.createdAt.gte = from
      if (to) where.createdAt.lte = to
    }

    return await prisma.sale.findMany({
      where,
      include: { client: true, user: { select: { id: true, name: true } }, details: { include: { product: true } } },
      orderBy: { createdAt: "desc" },
    })
  } catch (error) {
    return { error: "Error al obtener ventas" }
  }
}

export async function getSale(id: string) {
  try {
    const sale = await prisma.sale.findUnique({
      where: { id },
      include: { client: true, user: { select: { id: true, name: true } }, details: { include: { product: { include: { category: true } } } } },
    })
    if (!sale) return { error: "Venta no encontrada" }
    return sale
  } catch (error) {
    return { error: "Error al obtener venta" }
  }
}

export async function createSale(
  clientId: string | null,
  items: { productId: string; quantity: number; price: number }[]
) {
  try {
    await requireAuth()
    const user = await getCurrentUser()
    if (!user) return { error: "No autorizado" }

    const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0)

    const sale = await prisma.$transaction(async (tx) => {
      for (const item of items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } })
        if (!product) throw new Error(`Producto ${item.productId} no encontrado`)
        if (product.stock < item.quantity) throw new Error(`Stock insuficiente para ${product.name}`)
      }

      const created = await tx.sale.create({
        data: {
          clientId,
          userId: user.id,
          subtotal,
          total: subtotal,
          details: {
            create: items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
              subtotal: item.price * item.quantity,
            })),
          },
        },
        include: { details: true },
      })

      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        })
        await tx.inventoryMovement.create({
          data: {
            productId: item.productId,
            userId: user.id,
            type: "SALIDA",
            quantity: item.quantity,
            reference: `Venta #${created.number}`,
          },
        })
      }

      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: "CREAR",
          entity: "Venta",
          entityId: created.id,
          description: `Venta #${created.number} creada por ${user.name}`,
        },
      })

      return created
    })

    revalidatePath("/dashboard/sales")
    return sale
  } catch (error) {
    if (error instanceof Error) return { error: error.message }
    return { error: "Error al crear venta" }
  }
}

export async function getSalesByDateRange(from: Date, to: Date) {
  try {
    return await prisma.sale.findMany({
      where: { createdAt: { gte: from, lte: to } },
      include: { client: true, details: { include: { product: true } } },
      orderBy: { createdAt: "desc" },
    })
  } catch (error) {
    return { error: "Error al obtener ventas por rango" }
  }
}

export async function getTopProducts(limit: number = 10) {
  try {
    const products = await prisma.saleDetail.groupBy({
      by: ["productId"],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: limit,
    })

    const productIds = products.map((p) => p.productId)
    const productNames = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true },
    })

    const nameMap = new Map(productNames.map((p) => [p.id, p.name]))
    return products.map((p) => ({
      id: p.productId,
      name: nameMap.get(p.productId) || "Desconocido",
      total: p._sum.quantity || 0,
    }))
  } catch (error) {
    return { error: "Error al obtener productos más vendidos" }
  }
}

export async function getSalesForChart(days: number = 30) {
  try {
    const from = new Date()
    from.setDate(from.getDate() - days)
    from.setHours(0, 0, 0, 0)

    const sales = await prisma.sale.findMany({
      where: { createdAt: { gte: from } },
      select: { createdAt: true, total: true },
      orderBy: { createdAt: "asc" },
    })

    const chart: { date: string; total: number }[] = []
    for (let i = 0; i < days; i++) {
      const date = new Date(from)
      date.setDate(date.getDate() + i)
      const key = date.toISOString().split("T")[0]
      const daySales = sales
        .filter((s) => s.createdAt.toISOString().split("T")[0] === key)
        .reduce((sum, s) => sum + Number(s.total), 0)
      chart.push({ date: key, total: daySales })
    }

    return chart
  } catch (error) {
    return { error: "Error al obtener datos del gráfico" }
  }
}

