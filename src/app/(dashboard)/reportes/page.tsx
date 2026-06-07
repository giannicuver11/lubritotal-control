"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable } from "@/components/shared/data-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatCLP } from "@/lib/utils"
import {
  getTopSellingProducts,
  getSlowMovingProducts,
  getCriticalStock,
  getOutOfStock,
  getInventoryValuation,
  getEstimatedProfit,
  getSalesByCategory,
  getSalesByBrand,
} from "@/lib/actions/reports"
import type { ColumnDef } from "@tanstack/react-table"

const formatCurrency = formatCLP

const REPORT_TABS = [
  { value: "top", label: "Más Vendidos" },
  { value: "slow", label: "Menos Vendidos" },
  { value: "critical", label: "Stock Crítico" },
  { value: "outofstock", label: "Agotados" },
  { value: "valuation", label: "Inventario Valorizado" },
  { value: "profit", label: "Utilidad Estimada" },
  { value: "category", label: "Por Categoría" },
  { value: "brand", label: "Por Marca" },
]

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState("top")
  const [limit, setLimit] = useState("10")

  const [topData, setTopData] = useState<any[]>([])
  const [slowData, setSlowData] = useState<any[]>([])
  const [criticalData, setCriticalData] = useState<any[]>([])
  const [outOfStockData, setOutOfStockData] = useState<any[]>([])
  const [valuationData, setValuationData] = useState<{ products: any[]; totalValue: number } | null>(null)
  const [profitData, setProfitData] = useState<{ items: any[]; totalEstimatedProfit: number } | null>(null)
  const [categoryData, setCategoryData] = useState<any[]>([])
  const [brandData, setBrandData] = useState<any[]>([])
  const [loading, setLoading] = useState<Record<string, boolean>>({})

  const setTabLoading = (tab: string, isLoading: boolean) => {
    setLoading((prev) => ({ ...prev, [tab]: isLoading }))
  }

  const loadTabData = useCallback(async (tab: string) => {
    setTabLoading(tab, true)
    try {
      switch (tab) {
        case "top": {
          const result = await getTopSellingProducts(Number(limit))
          if (Array.isArray(result)) setTopData(result)
          break
        }
        case "slow": {
          const result = await getSlowMovingProducts()
          if (Array.isArray(result)) setSlowData(result)
          break
        }
        case "critical": {
          const result = await getCriticalStock()
          if (Array.isArray(result)) setCriticalData(result)
          break
        }
        case "outofstock": {
          const result = await getOutOfStock()
          if (Array.isArray(result)) setOutOfStockData(result)
          break
        }
        case "valuation": {
          const result = await getInventoryValuation()
          if (!("error" in result)) setValuationData(result as any)
          break
        }
        case "profit": {
          const result = await getEstimatedProfit()
          if (!("error" in result)) setProfitData(result as any)
          break
        }
        case "category": {
          const result = await getSalesByCategory()
          if (Array.isArray(result)) setCategoryData(result)
          break
        }
        case "brand": {
          const result = await getSalesByBrand()
          if (Array.isArray(result)) setBrandData(result)
          break
        }
      }
    } catch {
      // ignore
    }
    setTabLoading(tab, false)
  }, [limit])

  useEffect(() => {
    loadTabData(activeTab)
  }, [activeTab, loadTabData])

  useEffect(() => {
    if (activeTab === "top") {
      loadTabData("top")
    }
  }, [limit, activeTab, loadTabData])

  const topColumns: ColumnDef<any>[] = [
    { header: "#", cell: ({ row }) => row.index + 1 },
    { accessorKey: "code", header: "Código", cell: ({ row }) => <span className="font-mono text-xs">{row.original.code}</span> },
    { accessorKey: "name", header: "Producto" },
    { accessorKey: "totalQuantity", header: "Cant. Vendida", cell: ({ row }) => <span className="text-right block">{row.original.totalQuantity}</span> },
    { accessorKey: "totalRevenue", header: "Ingresos", cell: ({ row }) => <span className="text-right block">{formatCurrency(row.original.totalRevenue)}</span> },
  ]

  const slowColumns: ColumnDef<any>[] = [
    { accessorKey: "code", header: "Código", cell: ({ row }) => <span className="font-mono text-xs">{row.original.code}</span> },
    { accessorKey: "name", header: "Producto" },
    { accessorKey: "stock", header: "Stock", cell: ({ row }) => <span className="text-right block">{row.original.stock}</span> },
    { id: "category", header: "Categoría", cell: ({ row }) => row.original.category?.name || "-" },
  ]

  const criticalColumns: ColumnDef<any>[] = [
    { accessorKey: "code", header: "Código", cell: ({ row }) => <span className="font-mono text-xs">{row.original.code}</span> },
    { accessorKey: "name", header: "Producto" },
    { id: "category", header: "Categoría", cell: ({ row }) => row.original.category?.name || "-" },
    { accessorKey: "stock", header: "Stock", cell: ({ row }) => (
      <Badge variant={row.original.stock === 0 ? "destructive" : "warning"} className="text-right">{row.original.stock}</Badge>
    ) },
    { accessorKey: "minStock", header: "Stock Mín.", cell: ({ row }) => <span className="text-right block">{row.original.minStock}</span> },
  ]

  const outOfStockColumns: ColumnDef<any>[] = [
    { accessorKey: "code", header: "Código", cell: ({ row }) => <span className="font-mono text-xs">{row.original.code}</span> },
    { accessorKey: "name", header: "Producto" },
    { id: "category", header: "Categoría", cell: ({ row }) => row.original.category?.name || "-" },
    { accessorKey: "sellPrice", header: "P. Venta", cell: ({ row }) => <span className="text-right block">{formatCurrency(Number(row.original.sellPrice))}</span> },
  ]

  const valuationColumns: ColumnDef<any>[] = [
    { accessorKey: "code", header: "Código", cell: ({ row }) => <span className="font-mono text-xs">{row.original.code}</span> },
    { accessorKey: "name", header: "Producto" },
    { accessorKey: "buyPrice", header: "P. Compra", cell: ({ row }) => <span className="text-right block">{formatCurrency(Number(row.original.buyPrice))}</span> },
    { accessorKey: "stock", header: "Stock", cell: ({ row }) => <span className="text-right block">{row.original.stock}</span> },
    {
      id: "totalValue",
      header: "Valor Total",
      cell: ({ row }) => <span className="text-right block font-medium">{formatCurrency(Number(row.original.buyPrice) * row.original.stock)}</span>,
    },
  ]

  const profitColumns: ColumnDef<any>[] = [
    { accessorKey: "code", header: "Código", cell: ({ row }) => <span className="font-mono text-xs">{row.original.code}</span> },
    { accessorKey: "name", header: "Producto" },
    { accessorKey: "stock", header: "Stock", cell: ({ row }) => <span className="text-right block">{row.original.stock}</span> },
    { accessorKey: "buyPrice", header: "P. Compra", cell: ({ row }) => <span className="text-right block">{formatCurrency(Number(row.original.buyPrice))}</span> },
    { accessorKey: "sellPrice", header: "P. Venta", cell: ({ row }) => <span className="text-right block">{formatCurrency(Number(row.original.sellPrice))}</span> },
    { id: "profitPerUnit", header: "Utilidad/Unidad", cell: ({ row }) => <span className="text-right block text-green-600">{formatCurrency(Number(row.original.sellPrice) - Number(row.original.buyPrice))}</span> },
    { id: "totalProfit", header: "Utilidad Total", cell: ({ row }) => <span className="text-right block font-medium text-green-600">{formatCurrency(Number(row.original.totalProfit))}</span> },
  ]

  const categoryColumns: ColumnDef<any>[] = [
    { accessorKey: "name", header: "Categoría" },
    { accessorKey: "totalQuantity", header: "Unidades Vendidas", cell: ({ row }) => <span className="text-right block">{row.original.totalQuantity}</span> },
    { accessorKey: "totalRevenue", header: "Ingresos", cell: ({ row }) => <span className="text-right block font-medium">{formatCurrency(row.original.totalRevenue)}</span> },
  ]

  const brandColumns: ColumnDef<any>[] = [
    { accessorKey: "name", header: "Marca" },
    { accessorKey: "totalQuantity", header: "Unidades Vendidas", cell: ({ row }) => <span className="text-right block">{row.original.totalQuantity}</span> },
    { accessorKey: "totalRevenue", header: "Ingresos", cell: ({ row }) => <span className="text-right block font-medium">{formatCurrency(row.original.totalRevenue)}</span> },
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="Reportes" description="Análisis y estadísticas del inventario y ventas" />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex flex-wrap h-auto w-full">
          {REPORT_TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="text-xs">
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="top" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Productos Más Vendidos</CardTitle>
                <div className="flex items-center gap-2">
                  <Label className="text-xs">Límite</Label>
                  <Select value={limit} onValueChange={setLimit}>
                    <SelectTrigger className="w-20 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">Top 10</SelectItem>
                      <SelectItem value="20">Top 20</SelectItem>
                      <SelectItem value="50">Top 50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable columns={topColumns} data={topData} loading={loading.top} exportFileName="mas-vendidos" searchKey="name" searchPlaceholder="Buscar producto..." />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="slow" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Productos sin Movimiento (Sin Ventas)</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable columns={slowColumns} data={slowData} loading={loading.slow} exportFileName="menos-vendidos" searchKey="name" searchPlaceholder="Buscar producto..." />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="critical" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Stock Crítico</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable columns={criticalColumns} data={criticalData} loading={loading.critical} exportFileName="stock-critico" searchKey="name" searchPlaceholder="Buscar producto..." />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="outofstock" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Productos Agotados</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable columns={outOfStockColumns} data={outOfStockData} loading={loading.outofstock} exportFileName="productos-agotados" searchKey="name" searchPlaceholder="Buscar producto..." />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="valuation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Inventario Valorizado</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {valuationData && (
                <div className="flex items-center gap-4">
                  <div className="bg-muted rounded-lg px-4 py-2">
                    <p className="text-xs text-muted-foreground">Valor Total del Inventario</p>
                    <p className="text-xl font-bold">{formatCurrency(valuationData.totalValue)}</p>
                  </div>
                </div>
              )}
              <DataTable columns={valuationColumns} data={valuationData?.products || []} loading={loading.valuation} exportFileName="inventario-valorizado" searchKey="name" searchPlaceholder="Buscar producto..." />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Utilidad Estimada</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {profitData && (
                <div className="flex items-center gap-4">
                  <div className="bg-green-50 dark:bg-green-950 rounded-lg px-4 py-2">
                    <p className="text-xs text-muted-foreground">Utilidad Total Estimada</p>
                    <p className="text-xl font-bold text-green-600">{formatCurrency(profitData.totalEstimatedProfit)}</p>
                  </div>
                </div>
              )}
              <DataTable columns={profitColumns} data={profitData?.items || []} loading={loading.profit} exportFileName="utilidad-estimada" searchKey="name" searchPlaceholder="Buscar producto..." />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="category" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ventas por Categoría</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable columns={categoryColumns} data={categoryData} loading={loading.category} exportFileName="ventas-por-categoria" searchKey="name" searchPlaceholder="Buscar categoría..." />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="brand" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ventas por Marca</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable columns={brandColumns} data={brandData} loading={loading.brand} exportFileName="ventas-por-marca" searchKey="name" searchPlaceholder="Buscar marca..." />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

