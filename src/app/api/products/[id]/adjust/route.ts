import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const { quantity, reason, userId } = await request.json()

    const product = await prisma.product.findUnique({ where: { id } })
    if (!product) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
    }

    const newStock = product.stock + quantity

    const [updated] = await prisma.$transaction([
      prisma.product.update({
        where: { id },
        data: { stock: newStock },
      }),
      prisma.inventoryMovement.create({
        data: {
          productId: id,
          type: quantity > 0 ? "ENTRADA" : "SALIDA",
          quantity: Math.abs(quantity),
          reason: reason || "Ajuste manual",
          userId,
        },
      }),
    ])

    return NextResponse.json(updated)
  } catch {
    return NextResponse.json({ error: "Error al ajustar stock" }, { status: 500 })
  }
}

