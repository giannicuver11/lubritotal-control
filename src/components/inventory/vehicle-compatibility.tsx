"use client"

import { useState } from "react"
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import { Plus, Trash2, Search } from "lucide-react"

interface VehicleModel {
  id: string
  brand: string
  model: string
  year: number | null
}

interface Compatibility {
  id: string
  vehicleModel: VehicleModel
}

interface VehicleCompatibilityProps {
  productId: string
  vehicles: Compatibility[]
  onUpdate: () => void
}

export function VehicleCompatibility({ productId, vehicles, onUpdate }: VehicleCompatibilityProps) {
  const [searchOpen, setSearchOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [searchResults, setSearchResults] = useState<VehicleModel[]>([])
  const [searching, setSearching] = useState(false)

  const handleSearch = async (term: string) => {
    setSearch(term)
    if (!term.trim()) {
      setSearchResults([])
      return
    }
    setSearching(true)
    try {
      const res = await fetch(`/api/vehicle-models?search=${encodeURIComponent(term)}`)
      if (res.ok) {
        const data = await res.json()
        setSearchResults(data)
      }
    } catch {
      setSearchResults([])
    } finally {
      setSearching(false)
    }
  }

  const handleAdd = async (vehicleModelId: string) => {
    try {
      const res = await fetch(`/api/products/${productId}/compatibility`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vehicleModelId }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Error")
      }
      toast({ title: "Vehículo agregado", variant: "success" })
      setSearchOpen(false)
      setSearch("")
      setSearchResults([])
      onUpdate()
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" })
    }
  }

  const handleRemove = async (compatibilityId: string) => {
    try {
      const res = await fetch(`/api/products/${productId}/compatibility/${compatibilityId}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error()
      toast({ title: "Vehículo eliminado", variant: "success" })
      onUpdate()
    } catch {
      toast({ title: "Error", description: "No se pudo eliminar", variant: "destructive" })
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Vehículos Compatibles</CardTitle>
          <Button size="sm" onClick={() => setSearchOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Agregar Vehículo
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {vehicles.length === 0 ? (
          <p className="text-center py-6 text-muted-foreground">
            No hay vehículos compatibles registrados
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Marca</TableHead>
                <TableHead>Modelo</TableHead>
                <TableHead>Año</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vehicles.map((v) => (
                <TableRow key={v.id}>
                  <TableCell className="font-medium">{v.vehicleModel.brand}</TableCell>
                  <TableCell>{v.vehicleModel.model}</TableCell>
                  <TableCell>{v.vehicleModel.year || "-"}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemove(v.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Vehículo Compatible</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por marca o modelo..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9"
                autoFocus
              />
            </div>
            <div className="max-h-60 overflow-y-auto space-y-1">
              {searching ? (
                <p className="text-sm text-muted-foreground text-center py-4">Buscando...</p>
              ) : searchResults.length === 0 && search ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Sin resultados
                </p>
              ) : (
                searchResults.map((vm) => (
                  <button
                    key={vm.id}
                    className="w-full text-left p-2 rounded-md hover:bg-accent text-sm flex items-center justify-between"
                    onClick={() => handleAdd(vm.id)}
                  >
                    <span>
                      <strong>{vm.brand}</strong> {vm.model}
                    </span>
                    <span className="text-muted-foreground">{vm.year || "-"}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

