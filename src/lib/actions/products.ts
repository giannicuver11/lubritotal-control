"use server"

import { prisma } from "@/lib/db"
import { getCurrentUser, requireAuth, requireRole } from "@/lib/auth-utils"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { Prisma } from "@prisma/client"
import { productSchema } from "@/lib/validations"

export interface ProductFilters {
  search?: string
  categoryId?: string
  brandId?: string
  subcategoryId?: string
  viscosity?: string
  technology?: string
  tireType?: string
  tireMeasure?: string
  amperage?: string
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

export async function getProducts(filters: ProductFilters = {}) {
  try {
    const where: Prisma.ProductWhereInput = { active: true }
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search } },
        { code: { contains: filters.search } },
      ]
    }
    if (filters.categoryId) where.categoryId = filters.categoryId
    if (filters.brandId) where.brandId = filters.brandId
    if (filters.subcategoryId) where.subcategoryId = filters.subcategoryId
    if (filters.viscosity) where.viscosity = filters.viscosity
    if (filters.technology) where.technology = filters.technology
    if (filters.tireType) where.tireType = filters.tireType
    if (filters.tireMeasure) where.tireMeasure = filters.tireMeasure
    if (filters.amperage) where.amperage = filters.amperage

    let orderBy: Prisma.ProductOrderByWithRelationInput = { name: "asc" }
    const sortOrder = filters.sortOrder || "asc"
    if (filters.sortBy === "sellPrice" || filters.sortBy === "buyPrice") {
      orderBy = { [filters.sortBy]: sortOrder }
    } else if (filters.sortBy === "stock") {
      orderBy = { stock: sortOrder }
    }

    return await prisma.product.findMany({
      where,
      include: { category: true, brand: true, subcategory: true },
      orderBy,
    })
  } catch (error) {
    return { error: "Error al obtener productos" }
  }
}

export async function getProduct(id: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true, brand: true, subcategory: true, compatibleVehicles: { include: { vehicleModel: true } } },
    })
    if (!product) return { error: "Producto no encontrado" }
    return product
  } catch (error) {
    return { error: "Error al obtener producto" }
  }
}

export async function createProduct(data: z.infer<typeof productSchema>) {
  try {
    await requireAuth()
    const user = await getCurrentUser()
    if (!user) return { error: "No autorizado" }

    const parsed = productSchema.parse(data)
    const product = await prisma.product.create({ data: parsed as any })

    await prisma.stockHistory.create({
      data: { productId: product.id, quantity: parsed.stock },
    })

    revalidatePath("/dashboard/products")
    return product
  } catch (error) {
    if (error instanceof z.ZodError) return { error: "Datos inválidos" }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") return { error: "El código ya existe" }
    }
    return { error: "Error al crear producto" }
  }
}

export async function updateProduct(id: string, data: Partial<z.infer<typeof productSchema>>) {
  try {
    const product = await prisma.product.update({
      where: { id },
      data: data as any,
    })
    revalidatePath("/dashboard/products")
    return product
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") return { error: "El código ya existe" }
      if (error.code === "P2025") return { error: "Producto no encontrado" }
    }
    return { error: "Error al actualizar producto" }
  }
}

export async function deleteProduct(id: string) {
  try {
    await requireRole("ADMIN")
    await prisma.product.update({ where: { id }, data: { active: false } })
    revalidatePath("/dashboard/products")
    return { success: true }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") return { error: "Producto no encontrado" }
    }
    return { error: "Error al eliminar producto" }
  }
}

export async function adjustStock(id: string, quantity: number, type: "ENTRADA" | "SALIDA" | "AJUSTE", reason?: string) {
  try {
    const user = await getCurrentUser()
    if (!user) return { error: "No autorizado" }

    const product = await prisma.product.findUnique({ where: { id } })
    if (!product) return { error: "Producto no encontrado" }

    const [movement] = await prisma.$transaction([
      prisma.inventoryMovement.create({
        data: {
          productId: id,
          userId: user.id,
          type,
          quantity: Math.abs(quantity),
          reason,
        },
      }),
      prisma.stockHistory.create({
        data: { productId: id, quantity },
      }),
      prisma.product.update({
        where: { id },
        data: { stock: { increment: quantity } },
      }),
    ])

    revalidatePath("/dashboard/products")
    return movement
  } catch (error) {
    return { error: "Error al ajustar stock" }
  }
}
