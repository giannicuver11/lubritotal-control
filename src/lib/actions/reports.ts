"use server"

import { prisma } from "@/lib/db"
import { Prisma } from "@prisma/client"

export async function getTopSellingProducts(limit: number = 10) {
  try {
    const products = await prisma.saleDetail.groupBy({
      by: ["productId"],
      _sum: { quantity: true, subtotal: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: limit,
    })

    const productIds = products.map((p) => p.productId)
    const productData = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, code: true, stock: true },
    })

    const dataMap = new Map(productData.map((p) => [p.id, p]))
    return products.map((p) => ({
      ...dataMap.get(p.productId),
      totalQuantity: p._sum.quantity || 0,
      totalRevenue: Number(p._sum.subtotal || 0),
    }))
  } catch (error) {
    return { error: "Error al obtener productos más vendidos" }
  }
}

export async function getSlowMovingProducts() {
  try {
    const productsWithSales = await prisma.saleDetail.findMany({
      select: { productId: true },
      distinct: ["productId"],
    })
    const soldIds = productsWithSales.map((p) => p.productId)

    return await prisma.product.findMany({
      where: { id: { notIn: soldIds }, active: true },
      include: { category: { select: { name: true } }, brand: { select: { name: true } } },
      orderBy: { name: "asc" },
    })
  } catch (error) {
    return { error: "Error al obtener productos sin ventas" }
  }
}

export async function getCriticalStock() {
  try {
    const rows = await prisma.$queryRaw<Array<{ id: string; name: string; code: string; stock: number; minStock: number; categoryName: string | null }>>`
      SELECT p.id, p.name, p.code, p.stock, p.minStock, c.name as categoryName
      FROM products p
      LEFT JOIN categories c ON c.id = p.categoryId
      WHERE p.active = 1 AND p.stock > 0 AND p.minStock >= p.stock
      ORDER BY p.stock ASC
    `
    return rows.map(r => ({ ...r, category: r.categoryName ? { name: r.categoryName } : undefined }))
  } catch (error) {
    return { error: "Error al obtener stock crítico" }
  }
}

export async function getOutOfStock() {
  try {
    return await prisma.product.findMany({
      where: { stock: 0, active: true },
      include: { category: { select: { name: true } } },
      orderBy: { name: "asc" },
    })
  } catch (error) {
    return { error: "Error al obtener productos sin stock" }
  }
}

export async function getInventoryValuation() {
  try {
    const products = await prisma.product.findMany({
      where: { active: true },
      select: { id: true, name: true, code: true, stock: true, buyPrice: true, sellPrice: true },
      orderBy: { name: "asc" },
    })

    const totalValue = products.reduce((sum, p) => sum + Number(p.buyPrice) * p.stock, 0)
    return { products, totalValue }
  } catch (error) {
    return { error: "Error al obtener valoración de inventario" }
  }
}

export async function getEstimatedProfit() {
  try {
    const products = await prisma.product.findMany({
      where: { active: true },
      select: { id: true, name: true, code: true, stock: true, buyPrice: true, sellPrice: true },
    })

    const items = products.map((p) => ({
      ...p,
      profit: Number(p.sellPrice) - Number(p.buyPrice),
      totalProfit: (Number(p.sellPrice) - Number(p.buyPrice)) * p.stock,
    }))

    const totalEstimatedProfit = items.reduce((sum, p) => sum + p.totalProfit, 0)
    return { items, totalEstimatedProfit }
  } catch (error) {
    return { error: "Error al obtener ganancia estimada" }
  }
}

export async function getSalesByCategory() {
  try {
    const details = await prisma.saleDetail.findMany({
      select: { quantity: true, subtotal: true, product: { select: { category: { select: { id: true, name: true } } } } },
    })

    const map = new Map<string, { name: string; totalQuantity: number; totalRevenue: number }>()
    for (const d of details) {
      const cat = d.product.category
      if (!cat) continue
      const existing = map.get(cat.id) || { name: cat.name, totalQuantity: 0, totalRevenue: 0 }
      existing.totalQuantity += d.quantity
      existing.totalRevenue += Number(d.subtotal)
      map.set(cat.id, existing)
    }

    return [...map.values()].sort((a, b) => b.totalRevenue - a.totalRevenue)
  } catch (error) {
    return { error: "Error al obtener ventas por categoría" }
  }
}

export async function getSalesByBrand() {
  try {
    const details = await prisma.saleDetail.findMany({
      select: { quantity: true, subtotal: true, product: { select: { brand: { select: { id: true, name: true } } } } },
    })

    const map = new Map<string, { name: string; totalQuantity: number; totalRevenue: number }>()
    for (const d of details) {
      const brand = d.product.brand
      if (!brand) continue
      const existing = map.get(brand.id) || { name: brand.name, totalQuantity: 0, totalRevenue: 0 }
      existing.totalQuantity += d.quantity
      existing.totalRevenue += Number(d.subtotal)
      map.set(brand.id, existing)
    }

    return [...map.values()].sort((a, b) => b.totalRevenue - a.totalRevenue)
  } catch (error) {
    return { error: "Error al obtener ventas por marca" }
  }
}

export async function getSalesByClient(clientId: string) {
  try {
    const sales = await prisma.sale.findMany({
      where: { clientId },
      include: { details: { include: { product: true } } },
      orderBy: { createdAt: "desc" },
    })

    const totalSpent = sales.reduce((sum, s) => sum + Number(s.total), 0)
    return { sales, totalSpent, count: sales.length }
  } catch (error) {
    return { error: "Error al obtener ventas del cliente" }
  }
}

export async function getVehicleHistory(vehicleId: string) {
  try {
    const [orders, sales] = await Promise.all([
      prisma.workOrder.findMany({
        where: { vehicleId },
        include: { parts: { include: { product: true } }, client: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.sale.findMany({
        where: { client: { vehicles: { some: { id: vehicleId } } } },
        include: { details: { include: { product: true } } },
        orderBy: { createdAt: "desc" },
      }),
    ])

    return { workOrders: orders, sales }
  } catch (error) {
    return { error: "Error al obtener historial del vehículo" }
  }
}

