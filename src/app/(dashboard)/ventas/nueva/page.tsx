"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { toast } from "@/components/ui/use-toast"
import { Search, Plus, Trash2, PackageSearch } from "lucide-react"
import { formatCLP } from "@/lib/utils"
import { createSale } from "@/lib/actions/sales"
import { ProductSearch } from "@/components/sales/sale-form"
import type { CartItem } from "@/types"

interface Product {
  id: string
  code: string
  name: string
  sellPrice: number
  stock: number
}

export default function NuevaVentaPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [cart, setCart] = useState<CartItem[]>([])
  const [clientId, setClientId] = useState<string | null>(null)
  const [clientSearch, setClientSearch] = useState("")
  const [clients, setClients] = useState<{ id: string; name: string; rut: string | null }[]>([])
  const [saving, setSaving] = useState(false)
  const [showClientDropdown, setShowClientDropdown] = useState(false)

  useEffect(() => {
    fetch("/api/products?limit=200")
      .then((r) => r.json())
      .then(setProducts)
  }, [])

  useEffect(() => {
    if (clientSearch.length < 1) {
      setClients([])
      return
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/clients?search=${encodeURIComponent(clientSearch)}`)
        const data = await res.json()
        setClients(Array.isArray(data) ? data : [])
      } catch {
        setClients([])
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [clientSearch])

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const addToCart = (product: Product) => {
    const existing = cart.find((c) => c.productId === product.id)
    if (existing) {
      setCart(
        cart.map((c) =>
          c.productId === product.id
            ? { ...c, quantity: c.quantity + 1, subtotal: (c.quantity + 1) * c.price }
            : c
        )
      )
    } else {
      setCart([
        ...cart,
        {
          productId: product.id,
          code: product.code,
          name: product.name,
          quantity: 1,
          price: product.sellPrice,
          subtotal: product.sellPrice,
          stock: product.stock,
        },
      ])
    }
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(cart.filter((c) => c.productId !== productId))
    } else {
      setCart(
        cart.map((c) =>
          c.productId === productId
            ? { ...c, quantity, subtotal: quantity * c.price }
            : c
        )
      )
    }
  }

  const removeFromCart = (productId: string) => {
    setCart(cart.filter((c) => c.productId !== productId))
  }

  const subtotal = cart.reduce((sum, c) => sum + c.subtotal, 0)

  const handleConfirm = async () => {
    if (cart.length === 0) {
      toast({ title: "Error", description: "Agregue al menos un producto", variant: "destructive" })
      return
    }
    setSaving(true)
    try {
      const items = cart.map((c) => ({
        productId: c.productId,
        quantity: c.quantity,
        price: c.price,
      }))
      const result = await createSale(clientId, items)
      if ("error" in result) {
        toast({ title: "Error", description: result.error, variant: "destructive" })
        return
      }
      toast({ title: "Venta creada", description: `Venta #${(result as any).number} registrada exitosamente`, variant: "success" })
      router.push(`/ventas/${(result as any).id}`)
    } catch {
      toast({ title: "Error", description: "Error al crear la venta", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const selectedClient = clients.find((c) => c.id === clientId)

  return (
    <div>
      <PageHeader
        title="Nueva Venta"
        breadcrumbs={[
          { label: "Ventas", href: "/ventas" },
          { label: "Nueva Venta" },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PackageSearch className="h-5 w-5" />
                Productos
              </CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre o código..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                  autoFocus
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[480px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Producto</TableHead>
                      <TableHead className="text-right">Stock</TableHead>
                      <TableHead className="text-right">Precio</TableHead>
                      <TableHead className="text-center"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          {searchTerm ? "Sin resultados" : "Escriba para buscar productos"}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredProducts.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell className="font-mono text-xs">{p.code}</TableCell>
                          <TableCell className="font-medium">{p.name}</TableCell>
                          <TableCell className="text-right text-sm">{p.stock}</TableCell>
                          <TableCell className="text-right">{formatCLP(p.sellPrice)}</TableCell>
                          <TableCell className="text-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => addToCart(p)}
                              disabled={p.stock <= 0}
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Agregar
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Carrito ({cart.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead className="text-right">Cant</TableHead>
                    <TableHead className="text-right">Precio</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cart.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        Carrito vacío
                      </TableCell>
                    </TableRow>
                  ) : (
                    cart.map((c) => (
                      <TableRow key={c.productId}>
                        <TableCell className="text-sm">{c.name}</TableCell>
                        <TableCell className="text-right">
                          <Input
                            type="number"
                            value={c.quantity}
                            onChange={(e) =>
                              updateQuantity(c.productId, parseInt(e.target.value) || 0)
                            }
                            className="w-14 h-8 text-right inline-block"
                            min={1}
                          />
                        </TableCell>
                        <TableCell className="text-right text-sm">{formatCLP(c.price)}</TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCLP(c.subtotal)}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFromCart(c.productId)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cliente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="relative">
                <Input
                  placeholder="Buscar cliente (opcional)..."
                  value={clientSearch}
                  onChange={(e) => {
                    setClientSearch(e.target.value)
                    setShowClientDropdown(true)
                    if (!e.target.value) setClientId(null)
                  }}
                  onFocus={() => setShowClientDropdown(true)}
                />
                {showClientDropdown && clients.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full rounded-md border bg-popover shadow-md max-h-48 overflow-y-auto">
                    {clients.map((c) => (
                      <button
                        key={c.id}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors"
                        onClick={() => {
                          setClientId(c.id)
                          setClientSearch(c.name)
                          setShowClientDropdown(false)
                        }}
                      >
                        {c.name}
                        {c.rut && <span className="text-muted-foreground ml-2">({c.rut})</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {selectedClient && (
                <p className="text-xs text-muted-foreground">
                  Cliente seleccionado: {selectedClient.name}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between text-lg font-bold mb-4">
                <span>Subtotal</span>
                <span>{formatCLP(subtotal)}</span>
              </div>
              <Button
                onClick={handleConfirm}
                className="w-full"
                disabled={saving || cart.length === 0}
              >
                {saving ? "Procesando..." : "Confirmar Venta"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

