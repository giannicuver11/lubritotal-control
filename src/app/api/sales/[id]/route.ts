import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const sale = await prisma.sale.findUnique({
      where: { id },
      include: {
        user: { select: { name: true } },
        client: { select: { name: true, rut: true } },
        details: {
          include: { product: { select: { name: true, code: true } } },
        },
      },
    })
    if (!sale) {
      return NextResponse.json({ error: "Venta no encontrada" }, { status: 404 })
    }
    return NextResponse.json(sale)
  } catch {
    return NextResponse.json({ error: "Error al obtener venta" }, { status: 500 })
  }
}

