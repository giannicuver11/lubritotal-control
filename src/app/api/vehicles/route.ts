import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const search = searchParams.get("search") || ""
  const clientId = searchParams.get("clientId") || ""

  try {
    const vehicles = await prisma.vehicle.findMany({
      where: {
        ...(clientId ? { clientId } : {}),
        ...(search
          ? {
              OR: [
                { plate: { contains: search,  } },
                { brand: { contains: search,  } },
                { model: { contains: search,  } },
              ],
            }
          : {}),
      },
      include: { client: { select: { name: true } } },
      orderBy: { plate: "asc" },
    })
    return NextResponse.json(vehicles)
  } catch {
    return NextResponse.json({ error: "Error al obtener vehículos" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const vehicle = await prisma.vehicle.create({
      data: {
        plate: body.plate.toUpperCase(),
        brand: body.brand,
        model: body.model,
        year: body.year ? parseInt(body.year) : null,
        clientId: body.clientId,
      },
      include: { client: { select: { name: true } } },
    })
    return NextResponse.json(vehicle)
  } catch (e: any) {
    if (e.code === "P2002") {
      return NextResponse.json({ error: "La patente ya existe" }, { status: 400 })
    }
    return NextResponse.json({ error: "Error al crear vehículo" }, { status: 500 })
  }
}

