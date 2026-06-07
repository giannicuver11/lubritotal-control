"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Minus, Trash2, Search } from "lucide-react"
import { formatCLP } from "@/lib/utils"
import type { CartItem } from "@/types"

interface Product {
  id: string
  code: string
  name: string
  sellPrice: number
  stock: number
}

interface ProductSearchProps {
  onAddProduct: (product: Product) => void
  searchTerm: string
  onSearchChange: (value: string) => void
  results: Product[]
  loading?: boolean
}

export function ProductSearch({
  onAddProduct,
  searchTerm,
  onSearchChange,
  results,
  loading = false,
}: ProductSearchProps) {
  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre o código..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
          autoFocus
        />
      </div>

      {searchTerm && (
        <div className="rounded-md border max-h-64 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">Buscando...</div>
          ) : results.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">Sin resultados</div>
          ) : (
            results.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between px-3 py-2 hover:bg-accent cursor-pointer transition-colors border-b last:border-0"
                onClick={() => {
                  onAddProduct(p)
                  onSearchChange("")
                }}
              >
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium truncate">{p.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {p.code} | Stock: {p.stock} | {formatCLP(p.sellPrice)}
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="ml-2 shrink-0">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

interface CartItemRowProps {
  item: CartItem
  onUpdateQuantity: (productId: string, quantity: number) => void
  onRemove: (productId: string) => void
}

export function CartItemRow({ item, onUpdateQuantity, onRemove }: CartItemRowProps) {
  return (
    <div className="flex items-center gap-2 py-2 border-b last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{item.name}</p>
        <p className="text-xs text-muted-foreground">{item.code}</p>
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7"
          onClick={() => onUpdateQuantity(item.productId, item.quantity - 1)}
        >
          <Minus className="h-3 w-3" />
        </Button>
        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7"
          onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
          disabled={item.quantity >= item.stock}
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>
      <p className="w-20 text-right text-sm font-medium">{formatCLP(item.subtotal)}</p>
      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onRemove(item.productId)}>
        <Trash2 className="h-3.5 w-3.5 text-destructive" />
      </Button>
    </div>
  )
}

interface CartSummaryProps {
  items: CartItem[]
  subtotal: number
  onConfirm: () => void
  saving?: boolean
}

export function CartSummary({ items, subtotal, onConfirm, saving = false }: CartSummaryProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        {items.map((item) => (
          <div key={item.productId} className="flex items-center justify-between py-1.5 text-sm">
            <span className="truncate flex-1">{item.name}</span>
            <span className="text-muted-foreground mx-2">x{item.quantity}</span>
            <span className="font-medium">{formatCLP(item.subtotal)}</span>
          </div>
        ))}
      </div>
      <div className="flex justify-between text-lg font-bold pt-2 border-t">
        <span>Subtotal</span>
        <span>{formatCLP(subtotal)}</span>
      </div>
      <Button onClick={onConfirm} className="w-full" disabled={saving || items.length === 0}>
        {saving ? "Procesando..." : "Confirmar Venta"}
      </Button>
    </div>
  )
}

interface ClientSelectProps {
  value: string | null
  onChange: (clientId: string | null) => void
}

export function ClientSelect({ value, onChange }: ClientSelectProps) {
  const [search, setSearch] = useState("")
  const [clients, setClients] = useState<{ id: string; name: string; rut: string | null }[]>([])
  const [open, setOpen] = useState(false)
  const [selectedName, setSelectedName] = useState("")
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (search.length < 1) {
      setClients([])
      return
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/clients?search=${encodeURIComponent(search)}`)
        const data = await res.json()
        setClients(Array.isArray(data) ? data : [])
      } catch {
        setClients([])
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    if (!open) {
      const handler = (e: MouseEvent) => {
        if (ref.current && !ref.current.contains(e.target as Node)) {
          setOpen(false)
        }
      }
      document.addEventListener("mousedown", handler)
      return () => document.removeEventListener("mousedown", handler)
    }
  }, [open])

  const handleSelect = (id: string, name: string) => {
    onChange(id)
    setSelectedName(name)
    setOpen(false)
    setSearch(name)
  }

  return (
    <div ref={ref} className="relative">
      <Input
        placeholder="Buscar cliente (opcional)..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value)
          setOpen(true)
          if (!e.target.value) {
            onChange(null)
            setSelectedName("")
          }
        }}
        onFocus={() => setOpen(true)}
      />
      {open && clients.length > 0 && (
        <div className="absolute z-10 mt-1 w-full rounded-md border bg-popover shadow-md max-h-48 overflow-y-auto">
          {clients.map((c) => (
            <button
              key={c.id}
              className="w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors"
              onClick={() => handleSelect(c.id, c.name)}
            >
              {c.name}
              {c.rut && <span className="text-muted-foreground ml-2">({c.rut})</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

