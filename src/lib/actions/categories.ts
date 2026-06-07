"use server"

import { prisma } from "@/lib/db"
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

export async function getCategory(id: string) {
  try {
    const category = await prisma.category.findUnique({
      where: { id },
      include: { products: true, subcategories: true },
    })
    if (!category) return { error: "Categoría no encontrada" }
    return category
  } catch (error) {
    return { error: "Error al obtener categoría" }
  }
}

export async function createCategory(name: string, description?: string) {
  try {
    const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
    const category = await prisma.category.create({ data: { name, slug, description } })
    revalidatePath("/dashboard/categories")
    return category
  } catch (error) {
    return { error: "Error al crear categoría" }
  }
}

export async function updateCategory(id: string, name: string, description?: string) {
  try {
    const category = await prisma.category.update({
      where: { id },
      data: { name, description },
    })
    revalidatePath("/dashboard/categories")
    return category
  } catch (error) {
    return { error: "Error al actualizar categoría" }
  }
}

export async function deleteCategory(id: string) {
  try {
    await prisma.category.delete({ where: { id } })
    revalidatePath("/dashboard/categories")
    return { success: true }
  } catch (error) {
    return { error: "Error al eliminar categoría" }
  }
}

