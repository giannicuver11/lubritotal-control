"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { formatCLP, formatDate } from "@/lib/utils"
import { getWorkOrder, updateWorkOrder, addPartToOrder, removePartFromOrder } from "@/lib/actions/orders"
import { useToast } from "@/components/ui/use-toast"
import { AddPartDialog } from "@/components/orders/add-part-dialog"
import {
  ArrowLeft,
  Printer,
  Plus,
  Trash2,
  ChevronRight,
  ChevronDown,
  Loader2,
} from "lucide-react"
import Link from "next/link"

const formatCurrency = formatCLP

type OrderStatus = "PENDIENTE" | "EN_PROCESO" | "FINALIZADA" | "ENTREGADA"

interface OrderPart {
  id: string
  quantity: number
  price: number
  subtotal: number
  product: { id: string; name: string; code: string }
}

interface OrderDetail {
  id: string
  number: number
  client: { id: string; name: string; phone?: string | null }
  vehicle: { id: string; plate: string; brand: string; model: string; year?: number | null }
  user: { id: string; name: string }
  mileage: number | null
  diagnosis: string | null
  workDone: string | null
  laborCost: number
  total: number
  status: OrderStatus
  notes: string | null
  createdAt: Date
  parts: OrderPart[]
}

const STATUS_ORDER: OrderStatus[] = ["PENDIENTE", "EN_PROCESO", "FINALIZADA", "ENTREGADA"]

const STATUS_STYLES: Record<OrderStatus, "secondary" | "warning" | "success" | "default"> = {
  PENDIENTE: "secondary",
  EN_PROCESO: "warning",
  FINALIZADA: "success",
  ENTREGADA: "default",
}

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDIENTE: "Pendiente",
  EN_PROCESO: "En Proceso",
  FINALIZADA: "Finalizada",
  ENTREGADA: "Entregada",
}

export default function WorkOrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [laborCost, setLaborCost] = useState("0")
  const [savingLabor, setSavingLabor] = useState(false)
  const [partsDialogOpen, setPartsDialogOpen] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  const loadOrder = useCallback(async () => {
    setLoading(true)
    const result = await getWorkOrder(params.id as string)
    if ("error" in result) {
      toast({ title: "Error", description: (result as any).error, variant: "destructive" })
    } else {
      const o = result as any
      setOrder(o as OrderDetail)
      setLaborCost(String(Number(o.laborCost)))
    }
    setLoading(false)
  }, [params.id, toast])

  useEffect(() => {
    loadOrder()
  }, [loadOrder])

  async function handleStatusUpdate(newStatus: OrderStatus) {
    if (!order) return
    setUpdatingStatus(true)
    const result = await updateWorkOrder(order.id, { status: newStatus } as any)
    if ("error" in result) {
      toast({ title: "Error", description: (result as any).error, variant: "destructive" })
    } else {
      toast({ title: `Estado actualizado a ${STATUS_LABELS[newStatus]}`, variant: "success" })
      loadOrder()
    }
    setUpdatingStatus(false)
  }

  async function handleSaveLabor() {
    if (!order) return
    setSavingLabor(true)
    const result = await updateWorkOrder(order.id, { laborCost: Number(laborCost) } as any)
    if ("error" in result) {
      toast({ title: "Error", description: (result as any).error, variant: "destructive" })
    } else {
      toast({ title: "Mano de obra actualizada", variant: "success" })
      loadOrder()
    }
    setSavingLabor(false)
  }

  async function handleRemovePart(partId: string) {
    const result = await removePartFromOrder(partId)
    if ("error" in result) {
      toast({ title: "Error", description: (result as any).error, variant: "destructive" })
    } else {
      toast({ title: "Repuesto eliminado", variant: "success" })
      loadOrder()
    }
  }

  const currentStatusIndex = order ? STATUS_ORDER.indexOf(order.status) : -1
  const partsTotal = order ? order.parts.reduce((sum, p) => sum + Number(p.subtotal), 0) : 0
  const total = Number(laborCost) + partsTotal

  function handlePrint() {
    window.print()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="text-center py-16">
        <p className="text-lg text-muted-foreground">Orden de trabajo no encontrada</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push("/ordenes")}>
          Volver a órdenes
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 print:space-y-4">
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/ordenes")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">OT #{order.number}</h1>
              <Badge variant={STATUS_STYLES[order.status]} className="text-sm px-3 py-1">
                {STATUS_LABELS[order.status]}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">Creada el {formatDate(order.createdAt)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" /> Imprimir
          </Button>
        </div>
      </div>

      <div className="print:block hidden mb-4">
        <h1 className="text-2xl font-bold">Orden de Trabajo N° {order.number}</h1>
        <p className="text-sm text-muted-foreground">Fecha: {formatDate(order.createdAt)}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Cliente</CardTitle>
          </CardHeader>
          <CardContent>
            <Link href={`/clientes/${order.client.id}`} className="font-medium hover:underline">
              {order.client.name}
            </Link>
            {order.client.phone && (
              <p className="text-sm text-muted-foreground">{order.client.phone}</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Vehículo</CardTitle>
          </CardHeader>
          <CardContent>
            <Link href={`/vehiculos/${order.vehicle.id}`} className="font-medium hover:underline">
              {order.vehicle.brand} {order.vehicle.model}
            </Link>
            <p className="text-sm text-muted-foreground">
              {order.vehicle.plate}{order.vehicle.year ? ` · ${order.vehicle.year}` : ""}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Kilometraje</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{order.mileage ? `${order.mileage.toLocaleString()} km` : "-"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Mecánico</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{order.user.name}</p>
          </CardContent>
        </Card>
      </div>

      {order.diagnosis && (
        <Card>
          <CardHeader>
            <CardTitle>Diagnóstico</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{order.diagnosis}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Repuestos Utilizados</CardTitle>
          <Dialog open={partsDialogOpen} onOpenChange={setPartsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Plus className="mr-2 h-4 w-4" /> Agregar Repuesto
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Agregar Repuesto</DialogTitle>
              </DialogHeader>
              <AddPartDialog
                orderId={order.id}
                onSuccess={() => { setPartsDialogOpen(false); loadOrder() }}
              />
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Producto</TableHead>
                <TableHead className="text-right">Cantidad</TableHead>
                <TableHead className="text-right">Precio</TableHead>
                <TableHead className="text-right">Subtotal</TableHead>
                <TableHead className="text-right print:hidden">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.parts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Sin repuestos agregados
                  </TableCell>
                </TableRow>
              ) : (
                order.parts.map((part) => (
                  <TableRow key={part.id}>
                    <TableCell className="font-mono text-xs">{part.product.code}</TableCell>
                    <TableCell className="font-medium">{part.product.name}</TableCell>
                    <TableCell className="text-right">{part.quantity}</TableCell>
                    <TableCell className="text-right">{formatCurrency(Number(part.price))}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(Number(part.subtotal))}</TableCell>
                    <TableCell className="text-right print:hidden">
                      <Button variant="ghost" size="icon" onClick={() => handleRemovePart(part.id)}>
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
          <CardTitle>Trabajo Realizado</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            rows={3}
            value={order.workDone || ""}
            onChange={async (e) => {
              const val = e.target.value
              const result = await updateWorkOrder(order.id, { workDone: val } as any)
              if (!("error" in result)) {
                setOrder((prev) => prev ? { ...prev, workDone: val } : prev)
              }
            }}
            placeholder="Describa el trabajo realizado..."
          />
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Actualizar Estado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center gap-2">
              {STATUS_ORDER.map((s, i) => (
                <div key={s} className="flex items-center">
                  {i > 0 && <ChevronRight className="h-4 w-4 text-muted-foreground mx-1" />}
                  <Button
                    variant={order.status === s ? "default" : i < currentStatusIndex ? "outline" : "ghost"}
                    size="sm"
                    disabled={updatingStatus || i <= currentStatusIndex}
                    onClick={() => handleStatusUpdate(s)}
                    className="text-xs"
                  >
                    {STATUS_LABELS[s]}
                  </Button>
                </div>
              ))}
            </div>
            {order.status === "ENTREGADA" && (
              <p className="text-sm text-muted-foreground mt-2">Orden entregada al cliente</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notas</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              rows={3}
              value={order.notes || ""}
              onChange={async (e) => {
                const val = e.target.value
                const result = await updateWorkOrder(order.id, { notes: val } as any)
                if (!("error" in result)) {
                  setOrder((prev) => prev ? { ...prev, notes: val } : prev)
                }
              }}
              placeholder="Notas adicionales..."
            />
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Card className="w-80">
          <CardHeader>
            <CardTitle>Resumen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <Label htmlFor="laborCost" className="text-sm">Mano de obra</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="laborCost"
                  type="number"
                  value={laborCost}
                  onChange={(e) => setLaborCost(e.target.value)}
                  className="w-28 h-8 text-right"
                />
                <Button size="sm" variant="ghost" onClick={handleSaveLabor} disabled={savingLabor}>
                  {savingLabor ? <Loader2 className="h-3 w-3 animate-spin" /> : "Guardar"}
                </Button>
              </div>
            </div>
            <div className="flex justify-between text-sm">
              <span>Repuestos</span>
              <span className="font-medium">{formatCurrency(partsTotal)}</span>
            </div>
            <div className="h-px bg-border" />
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

