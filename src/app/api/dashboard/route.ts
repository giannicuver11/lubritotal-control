export const runtime = "nodejs"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const [
      salesDay,
      salesMonth,
      allProducts,
      topProductsRaw,
      recentMovements,
      openOrders,
      clientCount,
      salesLast30Days,
    ] = await Promise.all([
      prisma.sale.aggregate({
        _sum: { total: true },
        where: { createdAt: { gte: startOfDay } },
      }),
      prisma.sale.aggregate({
        _sum: { total: true },
        where: { createdAt: { gte: startOfMonth } },
      }),
      prisma.product.findMany({
        where: { active: true },
        select: { id: true, name: true, buyPrice: true, sellPrice: true, stock: true, minStock: true },
      }),
      prisma.saleDetail.groupBy({
        by: ["productId"],
        _sum: { quantity: true, subtotal: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: 5,
      }),
      prisma.inventoryMovement.findMany({
        take: 15,
        orderBy: { createdAt: "desc" },
        include: { product: { select: { name: true } }, user: { select: { name: true } } },
      }),
      prisma.workOrder.count({
        where: { status: { in: ["PENDIENTE", "EN_PROCESO"] } },
      }),
      prisma.client.count(),
      prisma.sale.findMany({
        where: { createdAt: { gte: thirtyDaysAgo } },
        select: { total: true, createdAt: true },
        orderBy: { createdAt: "asc" },
      }),
    ])

    const criticalStock = allProducts.filter((p) => p.stock > 0 && p.stock <= p.minStock).length
    const outOfStock = allProducts.filter((p) => p.stock === 0).length

    const topProductIds = topProductsRaw.map((t) => t.productId)
    const topProductsData = await prisma.product.findMany({
      where: { id: { in: topProductIds } },
      select: { id: true, name: true },
    })

    const topProducts = topProductsRaw.map((t) => ({
      name: topProductsData.find((p) => p.id === t.productId)?.name || "Desconocido",
      total: t._sum.quantity || 0,
      revenue: t._sum.subtotal || 0,
    }))

    const inventoryValue = allProducts.reduce((sum, p) => sum + Number(p.buyPrice) * p.stock, 0)
    const totalBuy = allProducts.reduce((sum, p) => sum + Number(p.buyPrice) * p.stock, 0)
    const totalSell = allProducts.reduce((sum, p) => sum + Number(p.sellPrice) * p.stock, 0)
    const estimatedProfit = totalSell - totalBuy

    // Daily sales chart
    const salesChart: { date: string; total: number }[] = []
    const salesMap = new Map<string, number>()
    for (const s of salesLast30Days) {
      const dateKey = new Date(s.createdAt).toISOString().split("T")[0]
      salesMap.set(dateKey, (salesMap.get(dateKey) || 0) + Number(s.total))
    }
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const key = d.toISOString().split("T")[0]
      salesChart.push({ date: key, total: salesMap.get(key) || 0 })
    }

    return NextResponse.json({
      salesDay: Number(salesDay._sum.total) || 0,
      salesMonth: Number(salesMonth._sum.total) || 0,
      openOrders,
      criticalStock,
      outOfStock,
      inventoryValue,
      estimatedProfit,
      clientCount,
      topProducts,
      recentMovements,
      salesChart,
    })
  } catch {
    return NextResponse.json(
      { error: "Error al obtener datos del dashboard" },
      { status: 500 }
    )
  }
}

