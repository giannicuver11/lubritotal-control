"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable } from "@/components/shared/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { Plus, Pencil, Eye, FileSpreadsheet } from "lucide-react"
import * as XLSX from "xlsx"

interface Vehicle {
  id: string
  plate: string
  brand: string
  model: string
  year: number | null
  mileage: number | null
  client: { id: string; name: string } | null
  clientId: string
}

interface Client {
  id: string
  name: string
  rut: string | null
}

export default function VehiclesPage() {
  const router = useRouter()
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editVehicle, setEditVehicle] = useState<Vehicle | null>(null)
  const [form, setForm] = useState({ plate: "", brand: "", model: "", year: "", mileage: "", clientId: "" })
  const [saving, setSaving] = useState(false)

  const fetchVehicles = () => {
    setLoading(true)
    const params = search ? `?search=${encodeURIComponent(search)}` : ""
    fetch(`/api/vehicles${params}`)
      .then((r) => r.json())
      .then(setVehicles)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchVehicles()
    fetch("/api/clients").then((r) => r.json()).then(setClients)
  }, [search])

  const openNew = () => {
    setForm({ plate: "", brand: "", model: "", year: "", mileage: "", clientId: "" })
    setEditVehicle(null)
    setDialogOpen(true)
  }

  const openEdit = (v: Vehicle) => {
    setForm({
      plate: v.plate,
      brand: v.brand,
      model: v.model,
      year: v.year?.toString() || "",
      mileage: v.mileage?.toString() || "",
      clientId: v.clientId,
    })
    setEditVehicle(v)
    setDialogOpen(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const url = editVehicle ? `/api/vehicles/${editVehicle.id}` : "/api/vehicles"
      const method = editVehicle ? "PUT" : "POST"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          year: form.year ? Number(form.year) : undefined,
          mileage: form.mileage ? Number(form.mileage) : undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Error")
      toast({
        title: editVehicle ? "Vehículo actualizado" : "Vehículo creado",
        variant: "success" as any,
      })
      setDialogOpen(false)
      fetchVehicles()
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const exportToExcel = () => {
    const data = vehicles.map((v) => ({
      Patente: v.plate,
      Marca: v.brand,
      Modelo: v.model,
      Año: v.year || "",
      Cliente: v.client?.name || "",
    }))
    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Vehículos")
    XLSX.writeFile(wb, "vehiculos.xlsx")
  }

  const columns: ColumnDef<Vehicle>[] = [
    { accessorKey: "plate", header: "Patente" },
    { accessorKey: "brand", header: "Marca" },
    { accessorKey: "model", header: "Modelo" },
    {
      accessorKey: "year",
      header: "Año",
      cell: ({ row }) => row.original.year || "-",
    },
    {
      id: "cliente",
      header: "Cliente",
      cell: ({ row }) => row.original.client?.name || "-",
    },
    {
      id: "acciones",
      header: "Acciones",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => router.push(`/vehiculos/${row.original.id}`)}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => openEdit(row.original)}>
            <Pencil className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Vehículos"
        description="Gestión de vehículos"
        actions={
          <Button onClick={openNew}>
            <Plus className="mr-2 h-4 w-4" /> Agregar Vehículo
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={vehicles}
        searchKey="plate"
        searchPlaceholder="Buscar por patente, marca o modelo..."
        loading={loading}
        exportFileName="vehiculos"
      />

      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={exportToExcel}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Exportar Excel
        </Button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) setDialogOpen(false) }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editVehicle ? "Editar Vehículo" : "Agregar Vehículo"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Patente *</Label>
              <Input value={form.plate} onChange={(e) => setForm({ ...form, plate: e.target.value })} placeholder="ABCD12" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Marca *</Label>
                <Input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Modelo *</Label>
                <Input value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Año</Label>
                <Input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Kilometraje</Label>
                <Input type="number" value={form.mileage} onChange={(e) => setForm({ ...form, mileage: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Cliente *</Label>
              <Select value={form.clientId} onValueChange={(v) => setForm({ ...form, clientId: v })}>
                <SelectTrigger><SelectValue placeholder="Buscar y seleccionar cliente..." /></SelectTrigger>
                <SelectContent>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}{c.rut ? ` (${c.rut})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleSave} className="w-full" disabled={saving}>
              {saving ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

