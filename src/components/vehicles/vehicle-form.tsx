"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import { vehicleSchema } from "@/lib/validations"

type VehicleFormData = z.infer<typeof vehicleSchema>

interface Client {
  id: string
  name: string
  rut: string | null
}

interface VehicleFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  vehicle?: { id: string; mileage?: number | null } & VehicleFormData
  onSuccess: () => void
}

export function VehicleForm({ open, onOpenChange, vehicle, onSuccess }: VehicleFormProps) {
  const [clients, setClients] = useState<Client[]>([])
  const [saving, setSaving] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: vehicle || {
      plate: "", brand: "", model: "", year: undefined, mileage: undefined, clientId: "",
    },
  })

  const selectedClientId = watch("clientId")

  useEffect(() => {
    fetch("/api/clients")
      .then((r) => r.json())
      .then(setClients)
  }, [])

  const onSubmit = async (data: VehicleFormData) => {
    setSaving(true)
    try {
      const url = vehicle ? `/api/vehicles/${vehicle.id}` : "/api/vehicles"
      const method = vehicle ? "PUT" : "POST"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || "Error")
      toast({
        title: vehicle ? "Vehículo actualizado" : "Vehículo creado",
        variant: "success" as any,
      })
      reset()
      onSuccess()
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{vehicle ? "Editar Vehículo" : "Nuevo Vehículo"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Patente *</Label>
            <Input {...register("plate")} placeholder="ABCD12" />
            {errors.plate && <p className="text-sm text-destructive">{errors.plate.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Marca *</Label>
              <Input {...register("brand")} />
              {errors.brand && <p className="text-sm text-destructive">{errors.brand.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Modelo *</Label>
              <Input {...register("model")} />
              {errors.model && <p className="text-sm text-destructive">{errors.model.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Año</Label>
              <Input type="number" {...register("year", { valueAsNumber: true })} />
              {errors.year && <p className="text-sm text-destructive">{errors.year.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Kilometraje</Label>
              <Input type="number" {...register("mileage", { valueAsNumber: true })} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Cliente *</Label>
            <Select
              value={selectedClientId || ""}
              onValueChange={(v) => setValue("clientId", v, { shouldValidate: true })}
            >
              <SelectTrigger><SelectValue placeholder="Buscar y seleccionar cliente..." /></SelectTrigger>
              <SelectContent>
                {clients.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}{c.rut ? ` (${c.rut})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.clientId && <p className="text-sm text-destructive">{errors.clientId.message}</p>}
          </div>
          <Button type="submit" className="w-full" disabled={saving}>
            {saving ? "Guardando..." : "Guardar"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

