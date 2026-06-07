import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (id) {
      const category = await prisma.category.findUnique({ where: { id }, include: { subcategories: true } })
      return NextResponse.json(category)
    }
    const categories = await prisma.category.findMany({
      include: { subcategories: true },
      orderBy: { name: "asc" },
    })
    return NextResponse.json(categories)
  } catch {
    return NextResponse.json({ error: "Error al obtener categorías" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { name } = await request.json()
    const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
    const category = await prisma.category.create({ data: { name, slug } })
    return NextResponse.json(category)
  } catch {
    return NextResponse.json({ error: "Error al crear categoría" }, { status: 500 })
  }
}

