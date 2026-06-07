"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DialogFooter } from "@/components/ui/dialog"
import { getProducts } from "@/lib/actions/products"
import { addPartToOrder } from "@/lib/actions/orders"
import { useToast } from "@/components/ui/use-toast"
import { Search, Loader2, Plus } from "lucide-react"
import { formatCLP } from "@/lib/utils"

const formatCurrency = formatCLP

interface AddPartDialogProps {
  orderId: string
  onSuccess: () => void
}

interface ProductItem {
  id: string
  name: string
  code: string
  sellPrice: number
  stock: number
}

export function AddPartDialog({ orderId, onSuccess }: AddPartDialogProps) {
  const { toast } = useToast()
  const [products, setProducts] = useState<ProductItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [price, setPrice] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    getProducts().then((result) => {
      if (Array.isArray(result)) {
        setProducts(result.map((p: any) => ({
          id: p.id,
          name: p.name,
          code: p.code,
          sellPrice: Number(p.sellPrice),
          stock: p.stock,
        })))
      }
      setLoading(false)
    })
  }, [])

  const filtered = useMemo(() => {
    if (!search) return products
    const q = search.toLowerCase()
    return products.filter(
      (p) => p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q)
    )
  }, [products, search])

  function handleSelectProduct(product: ProductItem) {
    setSelectedProduct(product)
    setPrice(String(product.sellPrice))
    setQuantity(1)
  }

  async function handleSubmit() {
    if (!selectedProduct) {
      toast({ title: "Error", description: "Seleccione un producto", variant: "destructive" })
      return
    }
    if (quantity < 1) {
      toast({ title: "Error", description: "Cantidad inválida", variant: "destructive" })
      return
    }
    const priceNum = Number(price)
    if (isNaN(priceNum) || priceNum <= 0) {
      toast({ title: "Error", description: "Precio inválido", variant: "destructive" })
      return
    }

    setSubmitting(true)
    const result = await addPartToOrder(orderId, selectedProduct.id, quantity, priceNum)
    if ("error" in result) {
      toast({ title: "Error", description: (result as any).error, variant: "destructive" })
    } else {
      toast({ title: "Repuesto agregado", variant: "success" })
      onSuccess()
    }
    setSubmitting(false)
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar producto por nombre o código..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setSelectedProduct(null)
          }}
          className="pl-9"
        />
      </div>

      <div className="max-h-[240px] overflow-y-auto space-y-1 border rounded-md p-1">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            {search ? "Sin resultados" : "Cargue productos..."}
          </div>
        ) : (
          filtered.map((product) => (
            <button
              key={product.id}
              type="button"
              onClick={() => handleSelectProduct(product)}
              className={`w-full flex items-center justify-between p-2 rounded-md text-left transition-colors ${
                selectedProduct?.id === product.id
                  ? "bg-primary/10 border border-primary/30"
                  : "hover:bg-accent"
              }`}
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{product.name}</p>
                <p className="text-xs text-muted-foreground">
                  {product.code} · Stock: {product.stock}
                </p>
              </div>
              <div className="text-sm font-medium shrink-0 ml-2">
                {formatCurrency(product.sellPrice)}
              </div>
            </button>
          ))
        )}
      </div>

      {selectedProduct && (
        <div className="space-y-3 border rounded-md p-4">
          <p className="text-sm font-medium">{selectedProduct.name}</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="quantity">Cantidad</Label>
              <Input
                id="quantity"
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="price">Precio unitario</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span className="font-medium">{formatCurrency(quantity * Number(price))}</span>
          </div>
        </div>
      )}

      <DialogFooter>
        <Button onClick={handleSubmit} disabled={!selectedProduct || submitting}>
          {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {submitting ? "Agregando..." : "Agregar"}
        </Button>
      </DialogFooter>
    </div>
  )
}

