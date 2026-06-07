import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      include: {
        client: { select: { id: true, name: true } },
        workOrders: {
          orderBy: { createdAt: "desc" },
          include: {
            user: { select: { name: true } },
            parts: { include: { product: { select: { name: true } } } },
          },
        },
      },
    })
    if (!vehicle) {
      return NextResponse.json({ error: "Vehículo no encontrado" }, { status: 404 })
    }
    return NextResponse.json(vehicle)
  } catch {
    return NextResponse.json({ error: "Error al obtener vehículo" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const body = await request.json()
    const vehicle = await prisma.vehicle.update({
      where: { id },
      data: {
        plate: body.plate?.toUpperCase(),
        brand: body.brand,
        model: body.model,
        year: body.year ? parseInt(body.year) : null,
        mileage: body.mileage ? parseInt(body.mileage) : null,
        clientId: body.clientId,
      },
    })
    return NextResponse.json(vehicle)
  } catch {
    return NextResponse.json({ error: "Error al actualizar vehículo" }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    await prisma.vehicle.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Error al eliminar vehículo" }, { status: 500 })
  }
}

