import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const order = await prisma.workOrder.findUnique({
      where: { id },
      include: {
        vehicle: { include: { client: { select: { name: true } } } },
        user: { select: { name: true } },
        parts: { include: { product: true } },
      },
    })
    if (!order) {
      return NextResponse.json({ error: "Orden no encontrada" }, { status: 404 })
    }
    return NextResponse.json(order)
  } catch {
    return NextResponse.json({ error: "Error al obtener orden" }, { status: 500 })
  }
}

