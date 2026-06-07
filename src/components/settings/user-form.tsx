"use client"

import { useState } from "react"
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
import { createUser, updateUser } from "@/lib/actions/users"

interface UserFormData {
  id?: string
  name: string
  email: string
  password: string
  role: string
}

interface UserFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user?: {
    id: string
    name: string
    email: string
    role: string
  } | null
  onSuccess: () => void
}

export function UserForm({ open, onOpenChange, user, onSuccess }: UserFormProps) {
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<UserFormData>({
    name: user?.name || "",
    email: user?.email || "",
    password: "",
    role: user?.role || "VENDEDOR",
  })

  const handleSave = async () => {
    setSaving(true)
    try {
      if (user) {
        const result = await updateUser(user.id, {
          name: form.name,
          email: form.email,
          password: form.password || undefined,
          role: form.role,
        })
        if ("error" in result) throw new Error(result.error)
        toast({ title: "Usuario actualizado", variant: "success" })
      } else {
        if (!form.password) {
          toast({ title: "Error", description: "La contraseña es requerida", variant: "destructive" })
          return
        }
        const result = await createUser(form.name, form.email, form.password, form.role)
        if ("error" in result) throw new Error(result.error)
        toast({ title: "Usuario creado", variant: "success" })
      }
      onOpenChange(false)
      onSuccess()
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{user ? "Editar usuario" : "Nuevo usuario"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre *</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">
              Contraseña {user ? "(dejar en blanco para mantener)" : "*"}
            </Label>
            <Input
              id="password"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required={!user}
            />
          </div>
          <div className="space-y-2">
            <Label>Rol</Label>
            <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ADMIN">ADMIN</SelectItem>
                <SelectItem value="VENDEDOR">VENDEDOR</SelectItem>
                <SelectItem value="MECANICO">MECÁNICO</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleSave} className="w-full" disabled={saving}>
            {saving ? "Guardando..." : "Guardar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

