import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const limit = parseInt(searchParams.get("limit") || "50")

  try {
    const sales = await prisma.sale.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true } },
        details: { include: { product: { select: { name: true, code: true } } } },
        client: { select: { name: true } },
      },
    })
    return NextResponse.json(sales)
  } catch {
    return NextResponse.json({ error: "Error al obtener ventas" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { items, userId, clientId } = await request.json()

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Debe incluir al menos un producto" }, { status: 400 })
    }

    let total = 0
    const saleDetails: any[] = []

    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } })
      if (!product) {
        return NextResponse.json({ error: `Producto no encontrado: ${item.productId}` }, { status: 404 })
      }
      if (product.stock < item.quantity) {
        return NextResponse.json({ error: `Stock insuficiente para ${product.name}` }, { status: 400 })
      }

      const subtotal = Number(item.price) * item.quantity
      total += subtotal

      saleDetails.push({
        productId: item.productId,
        quantity: item.quantity,
        price: Number(item.price),
        subtotal,
      })
    }

    const sale = await prisma.$transaction(async (tx) => {
      const newSale = await tx.sale.create({
        data: {
          total,
          subtotal: total,
          userId: userId || "unknown",
          clientId: clientId || null,
          details: { create: saleDetails },
        },
        include: {
          details: { include: { product: { select: { name: true } } } },
        },
      })

      for (const item of saleDetails) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        })
        await tx.inventoryMovement.create({
          data: {
            productId: item.productId,
            type: "SALIDA",
            quantity: item.quantity,
            reason: `Venta #${newSale.id.slice(0, 8)}`,
            userId,
          },
        })
      }

      return newSale
    })

    return NextResponse.json(sale)
  } catch {
    return NextResponse.json({ error: "Error al crear venta" }, { status: 500 })
  }
}
