"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ArrowLeft, Printer } from "lucide-react"
import { formatCLP, formatDateTime } from "@/lib/utils"
import { getSale } from "@/lib/actions/sales"
import { generateReceipt } from "@/components/sales/receipt"

interface SaleDetail {
  id: string
  quantity: number
  price: number
  subtotal: number
  product: { code: string; name: string }
}

interface SaleData {
  id: string
  number: number
  total: number
  subtotal: number
  createdAt: Date
  client: { name: string; rut: string | null } | null
  user: { name: string }
  details: SaleDetail[]
}

export default function VentaDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [sale, setSale] = useState<SaleData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getSale(params.id as string).then((result) => {
      if (!("error" in result)) {
        setSale(result as unknown as SaleData)
      }
      setLoading(false)
    })
  }, [params.id])

  if (loading) {
    return <div className="flex justify-center py-8 text-muted-foreground">Cargando...</div>
  }

  if (!sale) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Venta no encontrada</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push("/ventas")}>
          Volver
        </Button>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title={`Venta #${sale.number}`}
        breadcrumbs={[
          { label: "Ventas", href: "/ventas" },
          { label: `Venta #${sale.number}` },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push("/ventas")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Button>
            <Button onClick={() => generateReceipt(sale)}>
              <Printer className="mr-2 h-4 w-4" />
              Imprimir Comprobante
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">N° Venta</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-bold">#{sale.number}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Fecha</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-medium">{formatDateTime(sale.createdAt)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Cliente</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-medium">{sale.client?.name || "—"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Usuario</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-medium">{sale.user.name}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Productos</CardTitle>
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {sale.details.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="font-mono text-xs">{d.product.code}</TableCell>
                  <TableCell>{d.product.name}</TableCell>
                  <TableCell className="text-right">{d.quantity}</TableCell>
                  <TableCell className="text-right">{formatCLP(Number(d.price))}</TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCLP(Number(d.subtotal))}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex justify-end mt-4 pt-4 border-t">
            <div className="text-xl font-bold">
              Total: {formatCLP(Number(sale.total))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

