"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable } from "@/components/shared/data-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Eye } from "lucide-react"
import { formatCLP, formatDate } from "@/lib/utils"
import { getSales } from "@/lib/actions/sales"
import type { ColumnDef } from "@tanstack/react-table"

interface SaleRow {
  id: string
  number: number
  createdAt: Date
  total: number
  client: { name: string } | null
  user: { name: string }
  details: { id: string }[]
}

export default function VentasPage() {
  const router = useRouter()
  const [sales, setSales] = useState<SaleRow[]>([])
  const [loading, setLoading] = useState(true)
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")
  const [search, setSearch] = useState("")

  const loadSales = useCallback(async () => {
    setLoading(true)
    const fromDate = from ? new Date(from) : undefined
    const toDate = to ? new Date(to + "T23:59:59") : undefined
    const result = await getSales(fromDate, toDate)
    if (!Array.isArray(result)) {
      setSales([])
    } else {
      setSales(result as unknown as SaleRow[])
    }
    setLoading(false)
  }, [from, to])

  useEffect(() => {
    loadSales()
  }, [loadSales])

  const filtered = search
    ? sales.filter(
        (s) =>
          String(s.number).includes(search) ||
          s.client?.name?.toLowerCase().includes(search.toLowerCase()) ||
          s.user?.name?.toLowerCase().includes(search.toLowerCase())
      )
    : sales

  const columns: ColumnDef<SaleRow>[] = [
    {
      accessorKey: "number",
      header: "N° Venta",
      cell: ({ row }) => <span className="font-mono">#{row.original.number}</span>,
    },
    {
      accessorKey: "createdAt",
      header: "Fecha",
      cell: ({ row }) => formatDate(row.original.createdAt),
    },
    {
      accessorKey: "client",
      header: "Cliente",
      cell: ({ row }) => row.original.client?.name || "—",
    },
    {
      accessorKey: "total",
      header: "Total",
      cell: ({ row }) => formatCLP(Number(row.original.total)),
    },
    {
      accessorKey: "user",
      header: "Usuario",
      cell: ({ row }) => row.original.user.name,
    },
    {
      id: "acciones",
      header: "Acciones",
      cell: ({ row }) => (
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/ventas/${row.original.id}`}>
            <Eye className="mr-1 h-4 w-4" />
            Ver
          </Link>
        </Button>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Ventas"
        description="Historial de ventas realizadas"
        breadcrumbs={[{ label: "Ventas" }]}
        actions={
          <Button onClick={() => router.push("/ventas/nueva")}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Venta
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap items-end gap-4">
        <div className="space-y-1">
          <Label htmlFor="from" className="text-xs">Desde</Label>
          <Input id="from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="h-9" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="to" className="text-xs">Hasta</Label>
          <Input id="to" type="date" value={to} onChange={(e) => setTo(e.target.value)} className="h-9" />
        </div>
        {(from || to) && (
          <Button variant="ghost" size="sm" onClick={() => { setFrom(""); setTo("") }}>
            Limpiar
          </Button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        searchKey=""
        searchPlaceholder="Buscar por N° venta o cliente..."
        onSearch={setSearch}
        loading={loading}
        exportFileName="ventas"
      />
    </div>
  )
}

