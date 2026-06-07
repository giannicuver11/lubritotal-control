"use client"

import { useState, useEffect, useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DialogFooter } from "@/components/ui/dialog"
import { workOrderSchema } from "@/lib/validations"
import { getClients } from "@/lib/actions/clients"
import { getVehicles } from "@/lib/actions/vehicles"
import { createWorkOrder } from "@/lib/actions/orders"
import { useToast } from "@/components/ui/use-toast"
import { Search, Loader2 } from "lucide-react"

type WorkOrderFormData = z.infer<typeof workOrderSchema>

interface OrderFormProps {
  onSuccess: () => void
}

interface ClientOption {
  id: string
  name: string
  rut?: string | null
}

interface VehicleOption {
  id: string
  plate: string
  brand: string
  model: string
}

export function OrderForm({ onSuccess }: OrderFormProps) {
  const { toast } = useToast()
  const [clients, setClients] = useState<ClientOption[]>([])
  const [vehicles, setVehicles] = useState<VehicleOption[]>([])
  const [clientSearch, setClientSearch] = useState("")
  const [loadingClients, setLoadingClients] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const form = useForm<WorkOrderFormData>({
    resolver: zodResolver(workOrderSchema),
    defaultValues: {
      clientId: "",
      vehicleId: "",
      mileage: undefined,
      diagnosis: "",
      workDone: "",
      laborCost: 0,
      notes: "",
      status: "PENDIENTE",
    },
  })

  const selectedClientId = form.watch("clientId")

  useEffect(() => {
    getClients().then((result) => {
      if (Array.isArray(result)) {
        setClients(result.map((c: any) => ({ id: c.id, name: c.name, rut: c.rut })))
      }
      setLoadingClients(false)
    })
  }, [])

  useEffect(() => {
    if (selectedClientId) {
      form.setValue("vehicleId", "")
      getVehicles(undefined, selectedClientId).then((result) => {
        if (Array.isArray(result)) {
          setVehicles(result.map((v: any) => ({ id: v.id, plate: v.plate, brand: v.brand, model: v.model })))
        } else {
          setVehicles([])
        }
      })
    } else {
      setVehicles([])
    }
  }, [selectedClientId, form])

  const filteredClients = useMemo(() => {
    if (!clientSearch) return clients
    const q = clientSearch.toLowerCase()
    return clients.filter((c) => c.name.toLowerCase().includes(q) || (c.rut && c.rut.toLowerCase().includes(q)))
  }, [clients, clientSearch])

  async function onSubmit(data: WorkOrderFormData) {
    setSubmitting(true)
    const result = await createWorkOrder(data)
    if ("error" in result) {
      toast({ title: "Error", description: (result as any).error, variant: "destructive" })
    } else {
      toast({ title: "Orden creada", variant: "success" })
      onSuccess()
    }
    setSubmitting(false)
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="client">Cliente *</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground z-10" />
          <Input
            placeholder="Buscar cliente..."
            value={clientSearch}
            onChange={(e) => setClientSearch(e.target.value)}
            className="pl-9 mb-1"
          />
        </div>
        <Select
          value={form.watch("clientId")}
          onValueChange={(v) => form.setValue("clientId", v, { shouldValidate: true })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar cliente" />
          </SelectTrigger>
          <SelectContent className="max-h-[200px]">
            {loadingClients ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            ) : filteredClients.length === 0 ? (
              <div className="py-2 text-center text-sm text-muted-foreground">Sin resultados</div>
            ) : (
              filteredClients.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}{c.rut ? ` (${c.rut})` : ""}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
        {form.formState.errors.clientId && (
          <p className="text-sm text-destructive">{form.formState.errors.clientId.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="vehicle">Vehículo *</Label>
        <Select
          value={form.watch("vehicleId")}
          onValueChange={(v) => form.setValue("vehicleId", v, { shouldValidate: true })}
          disabled={!selectedClientId}
        >
          <SelectTrigger>
            <SelectValue placeholder={selectedClientId ? "Seleccionar vehículo" : "Primero seleccione un cliente"} />
          </SelectTrigger>
          <SelectContent className="max-h-[200px]">
            {vehicles.length === 0 ? (
              <div className="py-2 text-center text-sm text-muted-foreground">
                {selectedClientId ? "Sin vehículos" : "Seleccione un cliente primero"}
              </div>
            ) : (
              vehicles.map((v) => (
                <SelectItem key={v.id} value={v.id}>
                  {v.brand} {v.model} ({v.plate})
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
        {form.formState.errors.vehicleId && (
          <p className="text-sm text-destructive">{form.formState.errors.vehicleId.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="mileage">Kilometraje</Label>
          <Input
            id="mileage"
            type="number"
            {...form.register("mileage", { valueAsNumber: true })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Estado</Label>
          <Select
            value={form.watch("status")}
            onValueChange={(v) => form.setValue("status", v as any)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PENDIENTE">Pendiente</SelectItem>
              <SelectItem value="EN_PROCESO">En Proceso</SelectItem>
              <SelectItem value="FINALIZADA">Finalizada</SelectItem>
              <SelectItem value="ENTREGADA">Entregada</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="diagnosis">Diagnóstico</Label>
        <Textarea id="diagnosis" rows={3} {...form.register("diagnosis")} />
      </div>

      <DialogFooter>
        <Button type="submit" disabled={submitting}>
          {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {submitting ? "Creando..." : "Crear Orden"}
        </Button>
      </DialogFooter>
    </form>
  )
}

