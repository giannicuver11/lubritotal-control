"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ArrowLeft,
  Pencil,
  Car,
  Phone,
  MapPin,
  Building2,
  Mail,
  FileText,
  Eye,
} from "lucide-react"
import { formatCLP, formatDate } from "@/lib/utils"

interface ClientDetail {
  id: string
  name: string
  rut: string | null
  email: string | null
  phone: string | null
  address: string | null
  company: string | null
  notes: string | null
  createdAt: string
  vehicles: { id: string; plate: string; brand: string; model: string; year: number | null }[]
  sales: {
    id: string
    total: number
    createdAt: string
    items: { id: string; quantity: number; product: { name: string } }[]
  }[]
  workOrders: {
    id: string
    createdAt: string
    total: number
    status: string
    vehicle: { plate: string } | null
  }[]
}

const statusLabels: Record<string, string> = {
  PENDIENTE: "Pendiente",
  EN_PROCESO: "En Proceso",
  FINALIZADA: "Finalizada",
  ENTREGADA: "Entregada",
}

const statusVariants: Record<string, "warning" | "default" | "success" | "secondary"> = {
  PENDIENTE: "warning",
  EN_PROCESO: "default",
  FINALIZADA: "success",
  ENTREGADA: "secondary",
}

export default function ClientDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [client, setClient] = useState<ClientDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/clients/${params.id}`)
      .then((r) => r.json())
      .then(setClient)
      .finally(() => setLoading(false))
  }, [params.id])

  if (loading) return <div className="flex justify-center py-8">Cargando...</div>
  if (!client) return <div className="text-center py-8">Cliente no encontrado</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">{client.name}</h2>
        </div>
        <Button variant="outline" onClick={() => router.push(`/clientes/${client.id}/edit`)}>
          <Pencil className="mr-2 h-4 w-4" /> Editar
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">RUT</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><p className="font-medium">{client.rut || "-"}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">Teléfono</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><p className="font-medium">{client.phone || "-"}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">Email</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><p className="font-medium">{client.email || "-"}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">Empresa</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><p className="font-medium">{client.company || "-"}</p></CardContent>
        </Card>
      </div>

      {client.address && (
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm text-muted-foreground">Dirección</CardTitle>
          </CardHeader>
          <CardContent><p>{client.address}</p></CardContent>
        </Card>
      )}

      {client.notes && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">notas</CardTitle>
          </CardHeader>
          <CardContent><p className="text-sm whitespace-pre-wrap">{client.notes}</p></CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            Vehículos ({client.vehicles.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patente</TableHead>
                <TableHead>Marca</TableHead>
                <TableHead>Modelo</TableHead>
                <TableHead>Año</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {client.vehicles.map((v) => (
                <TableRow key={v.id}>
                  <TableCell className="font-mono font-medium">{v.plate}</TableCell>
                  <TableCell>{v.brand}</TableCell>
                  <TableCell>{v.model}</TableCell>
                  <TableCell>{v.year || "-"}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => router.push(`/vehiculos/${v.id}`)}>
                      <Eye className="mr-1 h-4 w-4" /> Ver
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {client.vehicles.length === 0 && (
                <TableRow><TableCell colSpan={5} className="text-center py-4 text-muted-foreground">Sin vehículos registrados</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Historial de Ventas</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>N° Venta</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Total</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {client.sales.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-mono text-xs">#{s.id.slice(0, 8)}</TableCell>
                  <TableCell>{formatDate(s.createdAt)}</TableCell>
                  <TableCell>{formatCLP(s.total)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => router.push(`/ventas/${s.id}`)}>
                      <Eye className="mr-1 h-4 w-4" /> Ver
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {client.sales.length === 0 && (
                <TableRow><TableCell colSpan={4} className="text-center py-4 text-muted-foreground">Sin ventas registradas</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Órdenes de Trabajo</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>N° OT</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Vehículo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {client.workOrders.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-mono text-xs">#{o.id.slice(0, 8)}</TableCell>
                  <TableCell>{formatDate(o.createdAt)}</TableCell>
                  <TableCell>{o.vehicle?.plate || "-"}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariants[o.status] || "secondary"}>
                      {statusLabels[o.status] || o.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">{formatCLP(o.total)}</TableCell>
                </TableRow>
              ))}
              {client.workOrders.length === 0 && (
                <TableRow><TableCell colSpan={5} className="text-center py-4 text-muted-foreground">Sin órdenes de trabajo</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

