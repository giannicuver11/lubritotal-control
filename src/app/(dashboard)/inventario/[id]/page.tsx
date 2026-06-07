"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PageHeader } from "@/components/shared/page-header"
import { StockBadge } from "@/components/shared/stock-badge"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { toast } from "@/components/ui/use-toast"
import { formatCurrency, formatDateTime } from "@/lib/utils"
import { Pencil, Trash2, ArrowLeft, Package } from "lucide-react"
import { StockAdjustment } from "@/components/inventory/stock-adjustment"
import { VehicleCompatibility } from "@/components/inventory/vehicle-compatibility"
import type { MovementType } from "@/types"

interface Product {
  id: string
  code: string
  name: string
  description: string | null
  category: { id: string; name: string }
  subcategory: { id: string; name: string } | null
  brand: { id: string; name: string } | null
  buyPrice: number
  sellPrice: number
  stock: number
  minStock: number
  location: string | null
  createdAt: string
  updatedAt: string
  compatibleVehicles: {
    id: string
    vehicleModel: { id: string; brand: string; model: string; year: number | null }
  }[]
}

interface Movement {
  id: string
  type: MovementType
  quantity: number
  reason: string | null
  createdAt: string
  user: { name: string }
}

export default function ProductDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [movements, setMovements] = useState<Movement[]>([])
  const [loading, setLoading] = useState(true)
  const [adjustOpen, setAdjustOpen] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  const fetchProduct = async () => {
    try {
      const res = await fetch(`/api/products/${params.id}`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      setProduct(data)
    } catch {
      toast({ title: "Error", description: "Producto no encontrado", variant: "destructive" })
      router.push("/inventario")
      return
    }
  }

  const fetchMovements = async () => {
    try {
      const res = await fetch(`/api/products/${params.id}/movements`)
      if (res.ok) {
        const data = await res.json()
        setMovements(data)
      }
    } catch {}
  }

  useEffect(() => {
    if (!params.id) return
    Promise.all([fetchProduct(), fetchMovements()]).finally(() => setLoading(false))
  }, [params.id])

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/products/${params.id}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      toast({ title: "Producto eliminado", variant: "success" })
      router.push("/inventario")
    } catch {
      toast({ title: "Error", description: "No se pudo eliminar", variant: "destructive" })
    }
  }

  const handleAdjustSuccess = () => {
    fetchProduct()
    fetchMovements()
    setAdjustOpen(false)
  }

  if (loading) {
    return <div className="flex justify-center py-12 text-muted-foreground">Cargando...</div>
  }

  if (!product) return null

  return (
    <div className="space-y-6">
      <PageHeader
        title={product.name}
        breadcrumbs={[
          { label: "Inventario", href: "/inventario" },
          { label: product.code },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push(`/inventario/${params.id}/edit`)}>
              <Pencil className="mr-2 h-4 w-4" /> Editar
            </Button>
            <Button variant="destructive" onClick={() => setDeleteConfirm(true)}>
              <Trash2 className="mr-2 h-4 w-4" /> Eliminar
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Código</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-mono">{product.code}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Stock</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            <span className="text-2xl font-bold">{product.stock}</span>
            <StockBadge stock={product.stock} minStock={product.minStock} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Stock Mínimo</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{product.minStock}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Precio Compra</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-bold">{formatCurrency(product.buyPrice)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Precio Venta</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-bold">{formatCurrency(product.sellPrice)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ubicación</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg">{product.location || "-"}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Categoría</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{product.category.name}</p>
            {product.subcategory && (
              <p className="text-sm text-muted-foreground">{product.subcategory.name}</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Marca</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{product.brand?.name || "-"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Descripción</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{product.description || "Sin descripción"}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="movements">
        <TabsList>
          <TabsTrigger value="movements">Movimientos de Stock</TabsTrigger>
          <TabsTrigger value="vehicles">Vehículos Compatibles</TabsTrigger>
        </TabsList>

        <TabsContent value="movements" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setAdjustOpen(true)}>
              <Package className="mr-2 h-4 w-4" /> Ajustar Stock
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 text-sm font-medium">Tipo</th>
                    <th className="text-right p-3 text-sm font-medium">Cantidad</th>
                    <th className="text-left p-3 text-sm font-medium">Motivo</th>
                    <th className="text-left p-3 text-sm font-medium">Usuario</th>
                    <th className="text-right p-3 text-sm font-medium">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {movements.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center p-6 text-muted-foreground">
                        Sin movimientos registrados
                      </td>
                    </tr>
                  ) : (
                    movements.map((m) => (
                      <tr key={m.id} className="border-b last:border-0">
                        <td className="p-3">
                          <span className={
                            m.type === "ENTRADA" ? "text-green-600 font-medium" :
                            m.type === "SALIDA" ? "text-red-600 font-medium" :
                            "text-yellow-600 font-medium"
                          }>
                            {m.type === "ENTRADA" ? "Entrada" : m.type === "SALIDA" ? "Salida" : "Ajuste"}
                          </span>
                        </td>
                        <td className="p-3 text-right font-mono">
                          {m.type === "ENTRADA" ? "+" : m.type === "SALIDA" ? "-" : ""}{m.quantity}
                        </td>
                        <td className="p-3 text-sm">{m.reason || "-"}</td>
                        <td className="p-3 text-sm">{m.user?.name || "-"}</td>
                        <td className="p-3 text-right text-sm text-muted-foreground">
                          {formatDateTime(m.createdAt)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>

          <StockAdjustment
            open={adjustOpen}
            onOpenChange={setAdjustOpen}
            productId={product.id}
            productName={product.name}
            currentStock={product.stock}
            onSuccess={handleAdjustSuccess}
          />
        </TabsContent>

        <TabsContent value="vehicles">
          <VehicleCompatibility
            productId={product.id}
            vehicles={product.compatibleVehicles}
            onUpdate={fetchProduct}
          />
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={deleteConfirm}
        onOpenChange={setDeleteConfirm}
        title="¿Eliminar producto?"
        description="Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  )
}

