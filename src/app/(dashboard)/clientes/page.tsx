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
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable } from "@/components/shared/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { Plus, Pencil, Eye, Search, FileSpreadsheet } from "lucide-react"
import { formatCLP } from "@/lib/utils"
import * as XLSX from "xlsx"

interface Client {
  id: string
  name: string
  rut: string | null
  phone: string | null
  email: string | null
  company: string | null
  address: string | null
  notes: string | null
  _count: { vehicles: number; sales: number; workOrders: number }
}

export default function ClientsPage() {
  const router = useRouter()
  const [clients, setClients] = useState<Client[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editClient, setEditClient] = useState<Client | null>(null)
  const [form, setForm] = useState({
    name: "", rut: "", phone: "", address: "", company: "", email: "", notes: "",
  })
  const [saving, setSaving] = useState(false)

  const fetchClients = () => {
    setLoading(true)
    const params = search ? `?search=${encodeURIComponent(search)}` : ""
    fetch(`/api/clients${params}`)
      .then((r) => r.json())
      .then(setClients)
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchClients() }, [search])

  const openNew = () => {
    setForm({ name: "", rut: "", phone: "", address: "", company: "", email: "", notes: "" })
    setEditClient(null)
    setDialogOpen(true)
  }

  const openEdit = (client: Client) => {
    setForm({
      name: client.name,
      rut: client.rut || "",
      phone: client.phone || "",
      address: client.address || "",
      company: client.company || "",
      email: client.email || "",
      notes: client.notes || "",
    })
    setEditClient(client)
    setDialogOpen(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const url = editClient ? `/api/clients/${editClient.id}` : "/api/clients"
      const method = editClient ? "PUT" : "POST"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      toast({
        title: editClient ? "Cliente actualizado" : "Cliente creado",
        variant: "success" as any,
      })
      setDialogOpen(false)
      fetchClients()
    } catch {
      toast({ title: "Error", description: "No se pudo guardar", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const exportToExcel = () => {
    const data = clients.map((c) => ({
      Nombre: c.name,
      RUT: c.rut || "",
      Teléfono: c.phone || "",
      Email: c.email || "",
      Empresa: c.company || "",
      Dirección: c.address || "",
      Vehículos: c._count.vehicles,
    }))
    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Clientes")
    XLSX.writeFile(wb, "clientes.xlsx")
  }

  const columns: ColumnDef<Client>[] = [
    { accessorKey: "name", header: "Nombre" },
    { accessorKey: "rut", header: "RUT" },
    { accessorKey: "phone", header: "Teléfono" },
    { accessorKey: "email", header: "Email" },
    { accessorKey: "company", header: "Empresa" },
    {
      id: "vehicles",
      header: "Vehículos",
      cell: ({ row }) => row.original._count.vehicles,
    },
    {
      id: "acciones",
      header: "Acciones",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => router.push(`/clientes/${row.original.id}`)}>
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
        title="Clientes"
        description="Gestión de clientes"
        actions={
          <Button onClick={openNew}>
            <Plus className="mr-2 h-4 w-4" /> Agregar Cliente
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={clients}
        searchKey="name"
        searchPlaceholder="Buscar por nombre, RUT o teléfono..."
        loading={loading}
        exportFileName="clientes"
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
            <DialogTitle>{editClient ? "Editar Cliente" : "Agregar Cliente"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nombre *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>RUT</Label>
                <Input value={form.rut} onChange={(e) => setForm({ ...form, rut: e.target.value })} placeholder="12.345.678-9" />
              </div>
              <div className="space-y-2">
                <Label>Teléfono</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+56 9 1234 5678" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Dirección</Label>
              <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Empresa</Label>
                <Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>notas</Label>
              <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
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

