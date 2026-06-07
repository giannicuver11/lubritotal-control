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
import { ArrowLeft, Pencil, Calendar, Gauge, User } from "lucide-react"
import { formatCLP, formatDate } from "@/lib/utils"

interface VehicleDetail {
  id: string
  plate: string
  brand: string
  model: string
  year: number | null
  mileage: number | null
  client: { id: string; name: string; rut: string | null; phone: string | null } | null
  workOrders: {
    id: string
    createdAt: string
    total: number
    status: string
    mileage: number | null
    workDone: string | null
  }[]
  sales: {
    id: string
    total: number
    createdAt: string
    items: { id: string; quantity: number; product: { name: string } }[]
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

export default function VehicleDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [vehicle, setVehicle] = useState<VehicleDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/vehicles/${params.id}`)
      .then((r) => r.json())
      .then(setVehicle)
      .finally(() => setLoading(false))
  }, [params.id])

  if (loading) return <div className="flex justify-center py-8">Cargando...</div>
  if (!vehicle) return <div className="text-center py-8">Vehículo no encontrado</div>

  const totalServices = vehicle.workOrders.length
  const totalSpent = vehicle.workOrders.reduce((sum, o) => sum + o.total, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">{vehicle.plate}</h2>
            <p className="text-muted-foreground">{vehicle.brand} {vehicle.model}{vehicle.year ? ` (${vehicle.year})` : ""}</p>
          </div>
        </div>
        <Button variant="outline" onClick={() => router.push(`/vehiculos/${vehicle.id}/edit`)}>
          <Pencil className="mr-2 h-4 w-4" /> Editar
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">Cliente</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {vehicle.client ? (
              <Button variant="link" className="h-auto p-0 font-medium" onClick={() => router.push(`/clientes/${vehicle.client!.id}`)}>
                {vehicle.client.name}
              </Button>
            ) : (
              <p className="font-medium">-</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">Kilometraje</CardTitle>
            <Gauge className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><p className="font-medium">{vehicle.mileage ? `${vehicle.mileage.toLocaleString()} km` : "-"}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">Servicios realizados</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><p className="font-bold text-2xl">{totalServices}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total invertido</CardTitle>
          </CardHeader>
          <CardContent><p className="font-bold text-2xl">{formatCLP(totalSpent)}</p></CardContent>
        </Card>
      </div>

      {vehicle.client && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Información del Cliente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 md:grid-cols-3">
              <div>
                <span className="text-sm text-muted-foreground">Nombre</span>
                <p className="font-medium">
                  <Button variant="link" className="h-auto p-0" onClick={() => router.push(`/clientes/${vehicle.client!.id}`)}>
                    {vehicle.client.name}
                  </Button>
                </p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">RUT</span>
                <p className="font-medium">{vehicle.client.rut || "-"}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Teléfono</span>
                <p className="font-medium">{vehicle.client.phone || "-"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Historial de Servicios</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>N° OT</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Kilometraje</TableHead>
                <TableHead>Trabajo Realizado</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vehicle.workOrders.map((o) => (
                <TableRow key={o.id} className="cursor-pointer" onClick={() => router.push(`/ordenes-trabajo/${o.id}`)}>
                  <TableCell className="font-mono text-xs">#{o.id.slice(0, 8)}</TableCell>
                  <TableCell>{formatDate(o.createdAt)}</TableCell>
                  <TableCell>{o.mileage ? `${o.mileage.toLocaleString()} km` : "-"}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{o.workDone || "-"}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariants[o.status] || "secondary"}>
                      {statusLabels[o.status] || o.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">{formatCLP(o.total)}</TableCell>
                </TableRow>
              ))}
              {vehicle.workOrders.length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Sin servicios registrados</TableCell></TableRow>
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
                <TableHead>Productos</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vehicle.sales.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-mono text-xs">#{s.id.slice(0, 8)}</TableCell>
                  <TableCell>{formatDate(s.createdAt)}</TableCell>
                  <TableCell>{s.items.length} productos</TableCell>
                  <TableCell className="text-right font-medium">{formatCLP(s.total)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => router.push(`/ventas/${s.id}`)}>
                      Ver
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {vehicle.sales.length === 0 && (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Sin ventas registradas</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

