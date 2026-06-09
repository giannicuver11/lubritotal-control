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
import { Plus, Pencil, Trash2, ArrowUpDown } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { ColumnDef } from "@tanstack/react-table"
import { ProductForm } from "@/components/inventory/product-form"

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
  viscosity: string | null
  technology: string | null
  presentation: string | null
  tireType: string | null
  tireMeasure: string | null
  amperage: string | null
  voltage: string | null
  engineType: string | null
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

const VISCOSIDADES = ["0W20", "0W30", "0W40", "5W20", "5W30", "5W40", "10W30", "10W40", "15W40", "20W50", "75W80", "75W90", "80W90", "85W140", "ATF", "CVTF", "ISO 32", "ISO 46", "ISO 68"]
const TECNOLOGIAS = ["Sintético", "Semi Sintético", "Mineral"]
const TIRE_TYPES = ["Touring", "Performance", "Premium", "HT", "AT", "MT", "Commercial"]
const AMPERAJES = ["45Ah", "55Ah", "60Ah", "65Ah", "75Ah", "90Ah", "100Ah", "150Ah"]

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
  const [viscosityFilter, setViscosityFilter] = useState("")
  const [technologyFilter, setTechnologyFilter] = useState("")
  const [tireTypeFilter, setTireTypeFilter] = useState("")
  const [amperageFilter, setAmperageFilter] = useState("")
  const [sortBy, setSortBy] = useState("")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [loading, setLoading] = useState(true)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [selectedCatName, setSelectedCatName] = useState("")

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set("search", search)
      if (categoryFilter) params.set("categoryId", categoryFilter)
      if (brandFilter) params.set("brandId", brandFilter)
      if (subcategoryFilter) params.set("subcategoryId", subcategoryFilter)
      if (viscosityFilter) params.set("viscosity", viscosityFilter)
      if (technologyFilter) params.set("technology", technologyFilter)
      if (tireTypeFilter) params.set("tireType", tireTypeFilter)
      if (amperageFilter) params.set("amperage", amperageFilter)
      if (sortBy) { params.set("sortBy", sortBy); params.set("sortOrder", sortOrder) }
      const res = await fetch(`/api/products?${params}`)
      const data = await res.json()
      setProducts(data)
    } catch {
      toast({ title: "Error", description: "No se pudieron cargar los productos", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }, [search, categoryFilter, brandFilter, subcategoryFilter, viscosityFilter, technologyFilter, tireTypeFilter, amperageFilter, sortBy, sortOrder])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  useEffect(() => {
    fetch("/api/categories").then((r) => r.json()).then(setCategories).catch(() => {})
    fetch("/api/brands").then((r) => r.json()).then(setBrands).catch(() => {})
  }, [])

  useEffect(() => {
    if (!categoryFilter) {
      setBrandFilter(""); setSubcategoryFilter(""); setSubcategories([])
      setViscosityFilter(""); setTechnologyFilter(""); setTireTypeFilter(""); setAmperageFilter("")
      setSelectedCatName("")
      return
    }
    fetch(`/api/brands?categoryId=${categoryFilter}`).then((r) => r.json()).then(setBrands).catch(() => {})
    fetch(`/api/categories?id=${categoryFilter}`).then((r) => r.json()).then((cat) => {
      setSubcategories(cat.subcategories || [])
      setSelectedCatName(cat.name || "")
    }).catch(() => { setSubcategories([]); setSelectedCatName("") })
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

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
    } else {
      setSortBy(field)
      setSortOrder("desc")
    }
  }

  const isCat = (name: string) => selectedCatName.toLowerCase() === name.toLowerCase()

  const columns: ColumnDef<Product>[] = [
    {
      accessorKey: "code",
      header: "Código",
      cell: ({ row }) => (
        <span
          className="font-mono text-xs text-primary hover:underline cursor-pointer"
          onClick={() => router.push(`/inventario/${row.original.id}`)}
        >
          {row.original.code}
        </span>
      ),
    },
    {
      accessorKey: "name",
      header: "Nombre",
      cell: ({ row }) => (
        <span
          className="font-medium hover:underline cursor-pointer"
          onClick={() => router.push(`/inventario/${row.original.id}`)}
        >
          {row.original.name}
        </span>
      ),
    },
    {
      accessorKey: "category.name",
      header: "Categoría",
      cell: ({ row }) => row.original.category.name,
    },
    ...(selectedCatName && isCat("aceites") ? [
      {
        accessorKey: "viscosity",
        header: "Viscosidad",
        cell: ({ row }: { row: any }) => row.original.viscosity || "-",
      } as ColumnDef<Product>,
      {
        accessorKey: "technology",
        header: "Tecnología",
        cell: ({ row }: { row: any }) => row.original.technology || "-",
      } as ColumnDef<Product>,
      {
        accessorKey: "presentation",
        header: "Presentación",
        cell: ({ row }: { row: any }) => row.original.presentation || "-",
      } as ColumnDef<Product>,
    ] : []),
    ...(selectedCatName && isCat("filtros") ? [
      {
        accessorKey: "engineType",
        header: "Motor",
        cell: ({ row }: { row: any }) => row.original.engineType || "-",
      } as ColumnDef<Product>,
    ] : []),
    ...(selectedCatName && isCat("neumaticos") ? [
      {
        accessorKey: "tireType",
        header: "Tipo",
        cell: ({ row }: { row: any }) => row.original.tireType || "-",
      } as ColumnDef<Product>,
      {
        accessorKey: "tireMeasure",
        header: "Medida",
        cell: ({ row }: { row: any }) => row.original.tireMeasure || "-",
      } as ColumnDef<Product>,
    ] : []),
    ...(selectedCatName && isCat("baterias") ? [
      {
        accessorKey: "amperage",
        header: "Amperaje",
        cell: ({ row }: { row: any }) => row.original.amperage || "-",
      } as ColumnDef<Product>,
      {
        accessorKey: "voltage",
        header: "Voltaje",
        cell: ({ row }: { row: any }) => row.original.voltage || "-",
      } as ColumnDef<Product>,
    ] : []),
    {
      accessorKey: "brand.name",
      header: "Marca",
      cell: ({ row }) => row.original.brand?.name || "-",
    },
    {
      accessorKey: "buyPrice",
      header: () => (
        <span onClick={() => toggleSort("buyPrice")} className="flex items-center gap-1 cursor-pointer select-none">
          Precio Compra <ArrowUpDown className="h-3 w-3" />
        </span>
      ),
      cell: ({ row }) => formatCurrency(row.original.buyPrice),
    },
    {
      accessorKey: "sellPrice",
      header: () => (
        <span onClick={() => toggleSort("sellPrice")} className="flex items-center gap-1 cursor-pointer select-none">
          Precio Venta <ArrowUpDown className="h-3 w-3" />
        </span>
      ),
      cell: ({ row }) => formatCurrency(row.original.sellPrice),
    },
    {
      accessorKey: "stock",
      header: () => (
        <span onClick={() => toggleSort("stock")} className="flex items-center gap-1 cursor-pointer select-none">
          Stock <ArrowUpDown className="h-3 w-3" />
        </span>
      ),
      cell: ({ row }) => (
        <StockBadge stock={row.original.stock} minStock={row.original.minStock} />
      ),
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
          <Button variant="ghost" size="icon" onClick={() => { setEditingProduct(row.original); setFormOpen(true) }}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setDeleteId(row.original.id)}>
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
        description={`${products.length} productos`}
        actions={
          <Button onClick={() => { setEditingProduct(null); setFormOpen(true) }}>
            <Plus className="mr-2 h-4 w-4" /> Agregar Producto
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v === "all" ? "" : v)}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Categoría" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {subcategories.length > 0 && (
          <Select value={subcategoryFilter} onValueChange={(v) => setSubcategoryFilter(v === "all" ? "" : v)}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Subcategoría" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {subcategories.map((s) => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Select value={brandFilter} onValueChange={(v) => setBrandFilter(v === "all" ? "" : v)}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Marca" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {brands.map((b) => (
              <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {isCat("aceites") && (
          <>
            <Select value={viscosityFilter} onValueChange={(v) => setViscosityFilter(v === "all" ? "" : v)}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="Viscosidad" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {VISCOSIDADES.map((v) => (
                  <SelectItem key={v} value={v}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={technologyFilter} onValueChange={(v) => setTechnologyFilter(v === "all" ? "" : v)}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Tecnología" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {TECNOLOGIAS.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        )}

        {isCat("neumaticos") && (
          <Select value={tireTypeFilter} onValueChange={(v) => setTireTypeFilter(v === "all" ? "" : v)}>
            <SelectTrigger className="w-[150px]"><SelectValue placeholder="Tipo" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {TIRE_TYPES.map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {isCat("baterias") && (
          <Select value={amperageFilter} onValueChange={(v) => setAmperageFilter(v === "all" ? "" : v)}>
            <SelectTrigger className="w-[150px]"><SelectValue placeholder="Amperaje" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {AMPERAJES.map((a) => (
                <SelectItem key={a} value={a}>{a}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Select value={sortBy ? `${sortBy}-${sortOrder}` : "none"} onValueChange={(v) => {
          if (v === "none") { setSortBy(""); return }
          const [field, order] = v.split("-")
          setSortBy(field)
          setSortOrder(order as "asc" | "desc")
        }}>
          <SelectTrigger className="w-[200px]"><SelectValue placeholder="Ordenar por..." /></SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Sin orden</SelectItem>
            <SelectItem value="sellPrice-desc">Precio Venta: Mayor a Menor</SelectItem>
            <SelectItem value="sellPrice-asc">Precio Venta: Menor a Mayor</SelectItem>
            <SelectItem value="buyPrice-desc">Precio Compra: Mayor a Menor</SelectItem>
            <SelectItem value="buyPrice-asc">Precio Compra: Menor a Mayor</SelectItem>
            <SelectItem value="stock-desc">Stock: Mayor a Menor</SelectItem>
            <SelectItem value="stock-asc">Stock: Menor a Mayor</SelectItem>
          </SelectContent>
        </Select>

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
