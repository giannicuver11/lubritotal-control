"use server"

import { prisma } from "@/lib/db"

export async function getDashboardKPIs() {
  try {
    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const [salesDay, salesMonth, openOrders, products, totalClients] = await Promise.all([
      prisma.sale.aggregate({
        where: { createdAt: { gte: startOfDay } },
        _sum: { total: true },
      }),
      prisma.sale.aggregate({
        where: { createdAt: { gte: startOfMonth } },
        _sum: { total: true },
      }),
      prisma.workOrder.count({
        where: { status: { notIn: ["FINALIZADA", "ENTREGADA"] } },
      }),
      prisma.product.findMany({
        select: { stock: true, buyPrice: true, sellPrice: true, minStock: true },
      }),
      prisma.client.count(),
    ])

    const inventoryValue = products.reduce((sum, p) => sum + Number(p.buyPrice) * p.stock, 0)
    const estimatedProfit = products.reduce((sum, p) => sum + (Number(p.sellPrice) - Number(p.buyPrice)) * p.stock, 0)
    const criticalStock = products.filter((p) => p.stock > 0 && p.stock <= p.minStock).length
    const outOfStock = products.filter((p) => p.stock === 0).length

    return {
      salesDay: Number(salesDay._sum.total || 0),
      salesMonth: Number(salesMonth._sum.total || 0),
      openOrders,
      inventoryValue,
      criticalStock,
      outOfStock,
      estimatedProfit,
      totalClients,
    }
  } catch (error) {
    return { error: "Error al obtener KPIs" }
  }
}

export async function getRecentActivity(limit: number = 10) {
  try {
    return await prisma.auditLog.findMany({
      take: limit,
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    })
  } catch (error) {
    return { error: "Error al obtener actividad reciente" }
  }
}

export async function getDashboardCharts() {
  try {
    const now = new Date()
    const from = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29)
    from.setHours(0, 0, 0, 0)

    const sales = await prisma.sale.findMany({
      where: { createdAt: { gte: from } },
      select: { createdAt: true, total: true, details: { select: { quantity: true, product: { select: { name: true, category: { select: { name: true } } } } } } },
      orderBy: { createdAt: "asc" },
    })

    const salesLast30Days: { date: string; total: number }[] = []
    for (let i = 0; i < 30; i++) {
      const date = new Date(from)
      date.setDate(date.getDate() + i)
      const key = date.toISOString().split("T")[0]
      const daySales = sales
        .filter((s) => s.createdAt.toISOString().split("T")[0] === key)
        .reduce((sum, s) => sum + Number(s.total), 0)
      salesLast30Days.push({ date: key, total: daySales })
    }

    const productMap = new Map<string, number>()
    const categoryMap = new Map<string, number>()
    for (const sale of sales) {
      for (const detail of sale.details) {
        productMap.set(detail.product.name, (productMap.get(detail.product.name) || 0) + detail.quantity)
        categoryMap.set(detail.product.category.name, (categoryMap.get(detail.product.category.name) || 0) + detail.quantity)
      }
    }

    const topProducts = [...productMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, total]) => ({ name, total }))

    const topCategories = [...categoryMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([name, total]) => ({ name, total }))

    return { salesLast30Days, topProducts, topCategories }
  } catch (error) {
    return { error: "Error al obtener gráficos" }
  }
}

