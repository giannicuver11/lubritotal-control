"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import { clientSchema } from "@/lib/validations"

type ClientFormData = z.infer<typeof clientSchema>

interface ClientFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  client?: { id: string } & ClientFormData
  onSuccess: () => void
}

export function ClientForm({ open, onOpenChange, client, onSuccess }: ClientFormProps) {
  const [saving, setSaving] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: client || {
      name: "", rut: "", phone: "", address: "", company: "", email: "", notes: "",
    },
  })

  const onSubmit = async (data: ClientFormData) => {
    setSaving(true)
    try {
      const url = client ? `/api/clients/${client.id}` : "/api/clients"
      const method = client ? "PUT" : "POST"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error()
      toast({
        title: client ? "Cliente actualizado" : "Cliente creado",
        variant: "success" as any,
      })
      reset()
      onSuccess()
    } catch {
      toast({ title: "Error", description: "No se pudo guardar", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{client ? "Editar Cliente" : "Nuevo Cliente"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Nombre *</Label>
            <Input {...register("name")} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>RUT</Label>
              <Input {...register("rut")} placeholder="12.345.678-9" />
              {errors.rut && <p className="text-sm text-destructive">{errors.rut.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Teléfono</Label>
              <Input {...register("phone")} placeholder="+56 9 1234 5678" />
              {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Dirección</Label>
            <Input {...register("address")} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Empresa</Label>
              <Input {...register("company")} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" {...register("email")} />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>
          </div>
          <div className="space-y-2">
            <Label>notas</Label>
            <Textarea {...register("notes")} />
          </div>
          <Button type="submit" className="w-full" disabled={saving}>
            {saving ? "Guardando..." : "Guardar"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

