export const runtime = "nodejs"
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get("type") || "top"
  const limit = parseInt(searchParams.get("limit") || "10")

  try {
    if (type === "top") {
      const items = await prisma.saleDetail.groupBy({
        by: ["productId"],
        _sum: { quantity: true, subtotal: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: limit,
      })

      const productIds = items.map((i) => i.productId)
      const products = await prisma.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, name: true, code: true, sellPrice: true },
      })

      const report = items.map((i) => ({
        product: products.find((p) => p.id === i.productId) || { name: "N/A", code: "", sellPrice: 0 },
        quantity: i._sum.quantity || 0,
        total: i._sum.subtotal || 0,
      }))

      return NextResponse.json(report)
    }

    if (type === "low") {
      const items = await prisma.saleDetail.groupBy({
        by: ["productId"],
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: "asc" } },
        take: limit,
      })

      const productIds = items.map((i) => i.productId)
      const products = await prisma.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, name: true, code: true },
      })

      const report = items.map((i) => ({
        product: products.find((p) => p.id === i.productId) || { name: "N/A", code: "" },
        quantity: i._sum.quantity || 0,
      }))

      return NextResponse.json(report)
    }

    if (type === "critical") {
      const products = await prisma.product.findMany({
        where: { active: true, stock: { lte: prisma.product.fields.minStock } },
        orderBy: { stock: "asc" },
        include: { category: true },
      })
      return NextResponse.json(products)
    }

    if (type === "outofstock") {
      const products = await prisma.product.findMany({
        where: { active: true, stock: 0 },
        orderBy: { name: "asc" },
        include: { category: true },
      })
      return NextResponse.json(products)
    }

    if (type === "inventory") {
      const products = await prisma.product.findMany({
        where: { active: true },
        orderBy: { name: "asc" },
        include: { category: true },
      })

      const totalBuy = products.reduce((sum, p) => sum + Number(p.buyPrice) * p.stock, 0)
      const totalSell = products.reduce((sum, p) => sum + Number(p.sellPrice) * p.stock, 0)

      return NextResponse.json({
        products: products.map((p) => ({
          ...p,
          investment: Number(p.buyPrice) * p.stock,
          potentialRevenue: Number(p.sellPrice) * p.stock,
          profit: (Number(p.sellPrice) - Number(p.buyPrice)) * p.stock,
        })),
        totals: {
          investment: totalBuy,
          potentialRevenue: totalSell,
          potentialProfit: totalSell - totalBuy,
        },
      })
    }

    return NextResponse.json({ error: "Tipo de reporte inválido" }, { status: 400 })
  } catch {
    return NextResponse.json({ error: "Error al generar reporte" }, { status: 500 })
  }
}

