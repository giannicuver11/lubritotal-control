"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable } from "@/components/shared/data-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Eye } from "lucide-react"
import { formatCLP, formatDate } from "@/lib/utils"
import { getWorkOrders, createWorkOrder } from "@/lib/actions/orders"
import { useToast } from "@/components/ui/use-toast"
import { OrderForm } from "@/components/orders/order-form"
import type { ColumnDef } from "@tanstack/react-table"

const formatCurrency = formatCLP

type OrderStatus = "PENDIENTE" | "EN_PROCESO" | "FINALIZADA" | "ENTREGADA"

interface WorkOrderItem {
  id: string
  number: number
  createdAt: Date
  client: { id: string; name: string }
  vehicle: { id: string; plate: string; brand: string; model: string }
  status: OrderStatus
  total: number
}

const STATUS_TABS = [
  { value: "", label: "Todas" },
  { value: "PENDIENTE", label: "Pendiente" },
  { value: "EN_PROCESO", label: "En Proceso" },
  { value: "FINALIZADA", label: "Finalizada" },
  { value: "ENTREGADA", label: "Entregada" },
]

const STATUS_STYLES: Record<string, "secondary" | "warning" | "success" | "default"> = {
  PENDIENTE: "secondary",
  EN_PROCESO: "warning",
  FINALIZADA: "success",
  ENTREGADA: "default",
}

const STATUS_LABELS: Record<string, string> = {
  PENDIENTE: "Pendiente",
  EN_PROCESO: "En Proceso",
  FINALIZADA: "Finalizada",
  ENTREGADA: "Entregada",
}

export default function WorkOrdersPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [orders, setOrders] = useState<WorkOrderItem[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("")
  const [search, setSearch] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)

  const loadOrders = useCallback(async () => {
    setLoading(true)
    const result = await getWorkOrders(statusFilter || undefined)
    if (Array.isArray(result)) {
      setOrders(result as any)
    } else {
      toast({ title: "Error", description: (result as any).error || "Error al cargar órdenes", variant: "destructive" })
    }
    setLoading(false)
  }, [statusFilter, toast])

  useEffect(() => {
    loadOrders()
  }, [loadOrders])

  const filtered = useMemo(() => {
    if (!search) return orders
    const q = search.toLowerCase()
    return orders.filter((o) => {
      const clientName = o.client?.name?.toLowerCase() || ""
      const plate = o.vehicle?.plate?.toLowerCase() || ""
      const brand = o.vehicle?.brand?.toLowerCase() || ""
      const model = o.vehicle?.model?.toLowerCase() || ""
      return clientName.includes(q) || plate.includes(q) || brand.includes(q) || model.includes(q) || `#${o.number}`.includes(q)
    })
  }, [orders, search])

  const columns: ColumnDef<WorkOrderItem>[] = useMemo(
    () => [
      {
        accessorKey: "number",
        header: "N\u00B0 OT",
        cell: ({ row }) => <span className="font-mono text-xs">#{row.original.number}</span>,
      },
      {
        accessorKey: "createdAt",
        header: "Fecha",
        cell: ({ row }) => formatDate(row.original.createdAt),
      },
      {
        id: "client",
        header: "Cliente",
        cell: ({ row }) => row.original.client?.name || "-",
      },
      {
        id: "vehicle",
        header: "Veh\u00EDculo",
        cell: ({ row }) => {
          const v = row.original.vehicle
          return v ? `${v.brand} ${v.model} (${v.plate})` : "-"
        },
      },
      {
        accessorKey: "status",
        header: "Estado",
        cell: ({ row }) => (
          <Badge variant={STATUS_STYLES[row.original.status] || "secondary"}>
            {STATUS_LABELS[row.original.status] || row.original.status}
          </Badge>
        ),
      },
      {
        accessorKey: "total",
        header: "Total",
        cell: ({ row }) => formatCurrency(Number(row.original.total)),
      },
      {
        id: "actions",
        header: "Acciones",
        cell: ({ row }) => (
          <Button variant="ghost" size="sm" onClick={() => router.push(`/ordenes/${row.original.id}`)}>
            <Eye className="h-4 w-4 mr-1" /> Ver
          </Button>
        ),
      },
    ],
    [router]
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Órdenes de Trabajo"
        description="Gestión de órdenes de trabajo"
        actions={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Nueva Orden
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Nueva Orden de Trabajo</DialogTitle>
              </DialogHeader>
              <OrderForm onSuccess={() => { setDialogOpen(false); loadOrders() }} />
            </DialogContent>
          </Dialog>
        }
      />

      <div className="flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => (
          <Button
            key={tab.value}
            variant={statusFilter === tab.value ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter(tab.value)}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        searchKey="client"
        searchPlaceholder="Buscar por cliente, vehículo o N° OT..."
        onSearch={setSearch}
        loading={loading}
        exportFileName="ordenes-de-trabajo"
      />
    </div>
  )
}

