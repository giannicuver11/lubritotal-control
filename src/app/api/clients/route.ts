import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const search = searchParams.get("search") || ""

  try {
    const clients = await prisma.client.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search,  } },
              { phone: { contains: search,  } },
              { company: { contains: search,  } },
            ],
          }
        : undefined,
      orderBy: { name: "asc" },
      include: { _count: { select: { vehicles: true } } },
    })
    return NextResponse.json(clients)
  } catch {
    return NextResponse.json({ error: "Error al obtener clientes" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const client = await prisma.client.create({
      data: {
        name: body.name,
        rut: body.rut || null,
        phone: body.phone || null,
        address: body.address || null,
        company: body.company || null,
        email: body.email || null,
        notes: body.notes || null,
      },
    })
    return NextResponse.json(client)
  } catch {
    return NextResponse.json({ error: "Error al crear cliente" }, { status: 500 })
  }
}

