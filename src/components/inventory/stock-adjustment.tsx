"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import type { MovementType } from "@/types"

interface StockAdjustmentProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  productId: string
  productName: string
  currentStock: number
  onSuccess?: () => void
}

export function StockAdjustment({
  open,
  onOpenChange,
  productId,
  productName,
  currentStock,
  onSuccess,
}: StockAdjustmentProps) {
  const [quantity, setQuantity] = useState(0)
  const [movementType, setMovementType] = useState<MovementType>("AJUSTE")
  const [reason, setReason] = useState("")
  const [saving, setSaving] = useState(false)

  const handleSubmit = async () => {
    if (quantity === 0) {
      toast({ title: "Error", description: "La cantidad debe ser diferente de 0", variant: "destructive" })
      return
    }

    if (movementType === "SALIDA" && quantity > currentStock) {
      toast({ title: "Error", description: "Stock insuficiente para la salida", variant: "destructive" })
      return
    }

    setSaving(true)
    try {
      const adjustedQuantity =
        movementType === "ENTRADA" ? Math.abs(quantity) :
        movementType === "SALIDA" ? -Math.abs(quantity) :
        quantity

      const res = await fetch(`/api/products/${productId}/adjust`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quantity: adjustedQuantity,
          reason,
          type: movementType,
          userId: "admin",
        }),
      })
      if (!res.ok) throw new Error()
      toast({ title: "Stock ajustado correctamente", variant: "success" })
      setQuantity(0)
      setReason("")
      onSuccess?.()
    } catch {
      toast({ title: "Error", description: "No se pudo ajustar el stock", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const handleClose = () => {
    setQuantity(0)
    setReason("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajustar Stock - {productName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Stock actual: <span className="font-bold text-foreground">{currentStock}</span>
          </div>

          <div className="space-y-2">
            <Label>Tipo de movimiento</Label>
            <Select value={movementType} onValueChange={(v) => setMovementType(v as MovementType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ENTRADA">Entrada</SelectItem>
                <SelectItem value="SALIDA">Salida</SelectItem>
                <SelectItem value="AJUSTE">Ajuste</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>
              {movementType === "ENTRADA" ? "Cantidad a ingresar" :
               movementType === "SALIDA" ? "Cantidad a retirar" :
               "Cantidad (positivo = entrada, negativo = salida)"}
            </Label>
            <Input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
              min={0}
            />
          </div>

          <div className="space-y-2">
            <Label>Motivo</Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Razón del ajuste..."
              rows={3}
            />
          </div>

          {movementType === "SALIDA" && (
            <p className="text-xs text-muted-foreground">
              Stock resultante: {currentStock - Math.abs(quantity)}
            </p>
          )}
          {movementType === "ENTRADA" && (
            <p className="text-xs text-muted-foreground">
              Stock resultante: {currentStock + Math.abs(quantity)}
            </p>
          )}

          <Button onClick={handleSubmit} className="w-full" disabled={saving}>
            {saving ? "Ajustando..." : "Ajustar Stock"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

