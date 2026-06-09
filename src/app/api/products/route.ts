import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const search = searchParams.get("search") || ""
  const categoryId = searchParams.get("categoryId") || ""
  const brandId = searchParams.get("brandId") || ""
  const subcategoryId = searchParams.get("subcategoryId") || ""
  const viscosity = searchParams.get("viscosity") || ""
  const technology = searchParams.get("technology") || ""
  const tireType = searchParams.get("tireType") || ""
  const tireMeasure = searchParams.get("tireMeasure") || ""
  const amperage = searchParams.get("amperage") || ""
  const sortBy = searchParams.get("sortBy") || ""
  const sortOrder = searchParams.get("sortOrder") || "asc"

  const where: any = { active: true }

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { code: { contains: search } },
    ]
  }
  if (categoryId) where.categoryId = categoryId
  if (brandId) where.brandId = brandId
  if (subcategoryId) where.subcategoryId = subcategoryId
  if (viscosity) where.viscosity = viscosity
  if (technology) where.technology = technology
  if (tireType) where.tireType = tireType
  if (tireMeasure) where.tireMeasure = tireMeasure
  if (amperage) where.amperage = amperage

  let orderBy: any = { updatedAt: "desc" }
  if (sortBy === "sellPrice" || sortBy === "buyPrice") {
    orderBy = { [sortBy]: sortOrder }
  } else if (sortBy === "stock") {
    orderBy = { stock: sortOrder }
  }

  try {
    const products = await prisma.product.findMany({
      where,
      include: { category: true, brand: true, subcategory: true },
      orderBy,
    })
    return NextResponse.json(products)
  } catch {
    return NextResponse.json({ error: "Error al obtener productos" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const product = await prisma.product.create({
      data: {
        code: body.code,
        name: body.name,
        description: body.description,
        categoryId: body.categoryId,
        subcategoryId: body.subcategoryId || null,
        brandId: body.brandId || null,
        buyPrice: body.buyPrice || 0,
        sellPrice: body.sellPrice || 0,
        stock: body.stock || 0,
        minStock: body.minStock || 0,
        location: body.location,
        viscosity: body.viscosity || null,
        technology: body.technology || null,
        presentation: body.presentation || null,
        tireType: body.tireType || null,
        tireMeasure: body.tireMeasure || null,
        amperage: body.amperage || null,
        voltage: body.voltage || null,
        engineType: body.engineType || null,
      },
      include: { category: true, brand: true },
    })
    return NextResponse.json(product)
  } catch (e: any) {
    if (e.code === "P2002") {
      return NextResponse.json({ error: "El código ya existe" }, { status: 400 })
    }
    return NextResponse.json({ error: "Error al crear producto" }, { status: 500 })
  }
}
