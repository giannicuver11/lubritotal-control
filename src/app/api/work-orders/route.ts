import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const vehicleId = searchParams.get("vehicleId") || ""

  try {
    const orders = await prisma.workOrder.findMany({
      where: vehicleId ? { vehicleId } : undefined,
      orderBy: { createdAt: "desc" },
      include: {
        vehicle: { include: { client: { select: { name: true } } } },
        user: { select: { name: true } },
        parts: { include: { product: { select: { name: true, code: true } } } },
      },
    })
    return NextResponse.json(orders)
  } catch {
    return NextResponse.json({ error: "Error al obtener órdenes" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { vehicleId, clientId, mileage, diagnosis, workDone, laborCost, parts, userId } = await request.json()

    const order = await prisma.$transaction(async (tx) => {
      let partsTotal = 0
      const partData: any[] = []

      for (const part of parts || []) {
        const product = await tx.product.findUnique({ where: { id: part.productId } })
        if (!product) throw new Error(`Producto no encontrado: ${part.productId}`)
        const subtotal = Number(part.price) * part.quantity
        partsTotal += subtotal
        partData.push({
          productId: part.productId,
          quantity: part.quantity,
          price: Number(part.price),
          subtotal,
        })
        await tx.product.update({
          where: { id: part.productId },
          data: { stock: { decrement: part.quantity } },
        })
      }

      const total = Number(laborCost || 0) + partsTotal

      return tx.workOrder.create({
        data: {
          vehicleId,
          clientId,
          mileage: mileage ? parseInt(mileage) : null,
          diagnosis,
          workDone,
          laborCost: Number(laborCost || 0),
          total,
          userId,
          parts: { create: partData },
        },
        include: {
          vehicle: { include: { client: { select: { name: true } } } },
          parts: { include: { product: { select: { name: true } } } },
        },
      })
    })

    return NextResponse.json(order)
  } catch {
    return NextResponse.json({ error: "Error al crear orden de trabajo" }, { status: 500 })
  }
}
