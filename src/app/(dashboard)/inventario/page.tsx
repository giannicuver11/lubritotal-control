"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DataTable } from "@/components/shared/data-table"
import { PageHeader } from "@/components/shared/page-header"
import { StockBadge } from "@/components/shared/stock-badge"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { toast } from "@/components/ui/use-toast"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { formatCurrency, formatDateTime } from "@/lib/utils"
import { ColumnDef } from "@tanstack/react-table"
import { ProductForm } from "@/components/inventory/product-form"
import type { MovementType } from "@/types"

interface Product {
  id: string
  code: string
  name: string
  category: { id: string; name: string }
  categoryId: string
  brand: { id: string; name: string } | null
  brandId: string | null
  subcategoryId: string | null
  buyPrice: number
  sellPrice: number
  stock: number
  minStock: number
  location: string | null
  description: string | null
  updatedAt: string
}

interface Category {
  id: string
  name: string
  subcategories?: { id: string; name: string }[]
}

interface Brand {
  id: string
  name: string
}

interface Subcategory {
  id: string
  name: string
}

export default function InventarioPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [brandFilter, setBrandFilter] = useState("")
  const [subcategoryFilter, setSubcategoryFilter] = useState("")
  const [loading, setLoading] = useState(true)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set("search", search)
      if (categoryFilter) params.set("categoryId", categoryFilter)
      if (brandFilter) params.set("brandId", brandFilter)
      if (subcategoryFilter) params.set("subcategoryId", subcategoryFilter)
      const res = await fetch(`/api/products?${params}`)
      const data = await res.json()
      setProducts(data)
    } catch {
      toast({ title: "Error", description: "No se pudieron cargar los productos", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }, [search, categoryFilter, brandFilter, subcategoryFilter])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  useEffect(() => {
    fetch("/api/categories").then((r) => r.json()).then(setCategories).catch(() => {})
    fetch("/api/brands").then((r) => r.json()).then(setBrands).catch(() => {})
  }, [])

  useEffect(() => {
    const brandUrl = categoryFilter
      ? `/api/brands?categoryId=${categoryFilter}`
      : "/api/brands"
    fetch(brandUrl).then((r) => r.json()).then(setBrands).catch(() => {})
    if (!categoryFilter) { setBrandFilter(""); setSubcategoryFilter("") }
    const catUrl = categoryFilter
      ? `/api/categories?id=${categoryFilter}`
      : ""
    if (catUrl) {
      fetch(catUrl).then((r) => r.json()).then((cat) => setSubcategories(cat.subcategories || [])).catch(() => setSubcategories([]))
    } else {
      setSubcategories([])
    }
  }, [categoryFilter])

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      const res = await fetch(`/api/products/${deleteId}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      toast({ title: "Producto eliminado", variant: "success" })
      setDeleteId(null)
      fetchProducts()
    } catch {
      toast({ title: "Error", description: "No se pudo eliminar el producto", variant: "destructive" })
    }
  }

  const columns: ColumnDef<Product>[] = [
    {
      accessorKey: "code",
      header: "Código",
      cell: ({ row }) => (
        <button
          className="font-mono text-xs text-primary hover:underline cursor-pointer"
          onClick={() => router.push(`/inventario/${row.original.id}`)}
        >
          {row.original.code}
        </button>
      ),
    },
    {
      accessorKey: "name",
      header: "Nombre",
      cell: ({ row }) => (
        <button
          className="font-medium hover:underline cursor-pointer"
          onClick={() => router.push(`/inventario/${row.original.id}`)}
        >
          {row.original.name}
        </button>
      ),
    },
    {
      accessorKey: "category.name",
      header: "Categoría",
      cell: ({ row }) => row.original.category.name,
    },
    {
      accessorKey: "brand.name",
      header: "Marca",
      cell: ({ row }) => row.original.brand?.name || "-",
    },
    {
      accessorKey: "buyPrice",
      header: "Precio Compra",
      cell: ({ row }) => formatCurrency(row.original.buyPrice),
    },
    {
      accessorKey: "sellPrice",
      header: "Precio Venta",
      cell: ({ row }) => formatCurrency(row.original.sellPrice),
    },
    {
      accessorKey: "stock",
      header: "Stock",
      cell: ({ row }) => (
        <StockBadge stock={row.original.stock} minStock={row.original.minStock} />
      ),
    },
    {
      accessorKey: "minStock",
      header: "Stock Mín.",
      cell: ({ row }) => row.original.minStock,
    },
    {
      accessorKey: "location",
      header: "Ubicación",
      cell: ({ row }) => row.original.location || "-",
    },
    {
      id: "acciones",
      header: "Acciones",
      cell: ({ row }) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setEditingProduct(row.original)
              setFormOpen(true)
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDeleteId(row.original.id)}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventario"
        actions={
          <Button
            onClick={() => {
              setEditingProduct(null)
              setFormOpen(true)
            }}
          >
            <Plus className="mr-2 h-4 w-4" /> Agregar Producto
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-4">
        <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v === "all" ? "" : v)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={brandFilter} onValueChange={(v) => setBrandFilter(v === "all" ? "" : v)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Marca" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {brands.map((b) => (
              <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {subcategories.length > 0 && (
          <Select value={subcategoryFilter} onValueChange={(v) => setSubcategoryFilter(v === "all" ? "" : v)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Subcategoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {subcategories.map((s) => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <div className="relative flex-1 min-w-[200px]">
          <Input
            placeholder="Buscar por código o nombre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={products}
        searchKey="name"
        searchPlaceholder="Buscar producto..."
        onSearch={setSearch}
        loading={loading}
        exportFileName="inventario"
      />

      <ProductForm
        open={formOpen}
        onOpenChange={setFormOpen}
        product={editingProduct}
        onSuccess={fetchProducts}
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="¿Eliminar producto?"
        description="Esta acción no se puede deshacer. El producto se desactivará del sistema."
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  )
}

