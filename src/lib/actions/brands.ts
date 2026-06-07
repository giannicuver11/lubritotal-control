"use server"

import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function getBrands() {
  try {
    return await prisma.brand.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { name: "asc" },
    })
  } catch (error) {
    return { error: "Error al obtener marcas" }
  }
}

export async function createBrand(name: string) {
  try {
    const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
    const brand = await prisma.brand.create({ data: { name, slug } })
    revalidatePath("/dashboard/brands")
    return brand
  } catch (error) {
    return { error: "Error al crear marca" }
  }
}

export async function deleteBrand(id: string) {
  try {
    await prisma.brand.delete({ where: { id } })
    revalidatePath("/dashboard/brands")
    return { success: true }
  } catch (error) {
    return { error: "Error al eliminar marca" }
  }
}

