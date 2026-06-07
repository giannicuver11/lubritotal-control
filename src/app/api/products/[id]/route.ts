import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true, brand: true },
    })
    if (!product) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
    }
    return NextResponse.json(product)
  } catch {
    return NextResponse.json({ error: "Error al obtener producto" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const body = await request.json()
    const product = await prisma.product.update({
      where: { id },
      data: {
        code: body.code,
        name: body.name,
        description: body.description,
        categoryId: body.categoryId,
        subcategoryId: body.subcategoryId || null,
        brandId: body.brandId || null,
        buyPrice: body.buyPrice,
        sellPrice: body.sellPrice,
        minStock: body.minStock,
        location: body.location,
      },
      include: { category: true, brand: true },
    })
    return NextResponse.json(product)
  } catch {
    return NextResponse.json({ error: "Error al actualizar producto" }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    await prisma.product.update({
      where: { id },
      data: { active: false },
    })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Error al eliminar producto" }, { status: 500 })
  }
}

