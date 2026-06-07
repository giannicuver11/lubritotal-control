"use server"

import { prisma } from "@/lib/db"
import { requireRole } from "@/lib/auth-utils"
import { revalidatePath } from "next/cache"

export async function getCategories() {
  try {
    return await prisma.category.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { name: "asc" },
    })
  } catch (error) {
    return { error: "Error al obtener categorías" }
  }
}

export async function createCategory(name: string) {
  await requireRole("ADMIN")
  try {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
    const category = await prisma.category.create({ data: { name, slug } })
    revalidatePath("/configuracion")
    return category
  } catch (error) {
    return { error: "Error al crear categoría" }
  }
}

export async function updateCategory(id: string, data: { name?: string }) {
  await requireRole("ADMIN")
  try {
    const updateData: any = { ...data }
    if (data.name) {
      updateData.slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
    }
    const category = await prisma.category.update({ where: { id }, data: updateData })
    revalidatePath("/configuracion")
    return category
  } catch (error) {
    return { error: "Error al actualizar categoría" }
  }
}

export async function deleteCategory(id: string) {
  await requireRole("ADMIN")
  try {
    await prisma.category.delete({ where: { id } })
    revalidatePath("/configuracion")
    return { success: true }
  } catch (error) {
    return { error: "Error al eliminar categoría" }
  }
}

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
  await requireRole("ADMIN")
  try {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
    const brand = await prisma.brand.create({ data: { name, slug } })
    revalidatePath("/configuracion")
    return brand
  } catch (error) {
    return { error: "Error al crear marca" }
  }
}

export async function deleteBrand(id: string) {
  await requireRole("ADMIN")
  try {
    await prisma.brand.delete({ where: { id } })
    revalidatePath("/configuracion")
    return { success: true }
  } catch (error) {
    return { error: "Error al eliminar marca" }
  }
}

