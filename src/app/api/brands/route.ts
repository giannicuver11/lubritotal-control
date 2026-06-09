export const runtime = "nodejs"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get("categoryId")
    const where: any = {}
    if (categoryId) {
      where.products = { some: { categoryId, active: true } }
    }
    const brands = await prisma.brand.findMany({
      where,
      orderBy: { name: "asc" },
    })
    return NextResponse.json(brands)
  } catch {
    return NextResponse.json({ error: "Error al obtener marcas" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { name } = await request.json()
    const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
    const brand = await prisma.brand.create({ data: { name, slug } })
    return NextResponse.json(brand)
  } catch {
    return NextResponse.json({ error: "Error al crear marca" }, { status: 500 })
  }
}

