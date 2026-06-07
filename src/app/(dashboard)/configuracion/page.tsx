"use client"

import { useEffect, useState } from "react"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import { UserForm } from "@/components/settings/user-form"
import { Plus, Pencil, Trash2, ShieldAlert, Wrench } from "lucide-react"
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getBrands,
  createBrand,
  deleteBrand,
} from "@/lib/actions/settings"
import { getUsers, deleteUser } from "@/lib/actions/users"

interface User {
  id: string
  name: string
  email: string
  role: string
  active: boolean
  createdAt: Date
}

interface Category {
  id: string
  name: string
  slug: string
  _count: { products: number }
}

interface Brand {
  id: string
  name: string
  _count: { products: number }
}

const workshopServices = [
  "Mecánica general",
  "Mantención preventiva",
  "Cambio de aceite",
  "Cambio de filtros",
  "Alineación y balanceo",
  "Frenos",
  "Suspensión",
  "Dirección",
  "Sistema eléctrico",
  "Aire acondicionado",
  "Transmisión",
  "Motor",
  "Diagnóstico computacional",
  "Cambio de neumáticos",
  "Escáner automotriz",
]

export default function ConfiguracionPage() {
  const [userRole, setUserRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const [users, setUsers] = useState<User[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<Brand[]>([])

  const [userDialog, setUserDialog] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  const [catDialog, setCatDialog] = useState(false)
  const [editingCat, setEditingCat] = useState<Category | null>(null)
  const [catForm, setCatForm] = useState({ name: "" })

  const [brandDialog, setBrandDialog] = useState(false)
  const [brandName, setBrandName] = useState("")

  const [deleteConfirm, setDeleteConfirm] = useState<{ type: string; id: string; name: string } | null>(null)

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        setUserRole(data.user?.role || null)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (userRole !== "ADMIN") return
    ;(async () => {
      const [u, c, b] = await Promise.all([
        getUsers(),
        getCategories(),
        getBrands(),
      ])
      if (!("error" in u)) setUsers(u as User[])
      if (!("error" in c)) setCategories(c as unknown as Category[])
      if (!("error" in b)) setBrands(b as unknown as Brand[])
    })()
  }, [userRole])

  const reloadCategories = async () => {
    const c = await getCategories()
    if (!("error" in c)) setCategories(c as unknown as Category[])
  }

  const reloadBrands = async () => {
    const b = await getBrands()
    if (!("error" in b)) setBrands(b as unknown as Brand[])
  }

  const reloadUsers = async () => {
    const u = await getUsers()
    if (!("error" in u)) setUsers(u as User[])
  }

  const openCatEdit = (cat: Category) => {
    setCatForm({ name: cat.name })
    setEditingCat(cat)
    setCatDialog(true)
  }

  const openCatNew = () => {
    setCatForm({ name: "" })
    setEditingCat(null)
    setCatDialog(true)
  }

  const handleCatSave = async () => {
    if (!catForm.name) return
    try {
      if (editingCat) {
        const r = await updateCategory(editingCat.id, { name: catForm.name })
        if ("error" in r) throw new Error(r.error)
      } else {
        const r = await createCategory(catForm.name)
        if ("error" in r) throw new Error(r.error)
      }
      toast({ title: editingCat ? "Categoría actualizada" : "Categoría creada", variant: "success" })
      setCatDialog(false)
      await reloadCategories()
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" })
    }
  }

  const handleCatDelete = async (id: string) => {
    try {
      const r = await deleteCategory(id)
      if ("error" in r) throw new Error(r.error)
      toast({ title: "Categoría eliminada", variant: "success" })
      setDeleteConfirm(null)
      await reloadCategories()
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" })
    }
  }

  const handleBrandCreate = async () => {
    if (!brandName) return
    try {
      const r = await createBrand(brandName)
      if ("error" in r) throw new Error(r.error)
      toast({ title: "Marca creada", variant: "success" })
      setBrandDialog(false)
      setBrandName("")
      await reloadBrands()
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" })
    }
  }

  const handleBrandDelete = async (id: string) => {
    try {
      const r = await deleteBrand(id)
      if ("error" in r) throw new Error(r.error)
      toast({ title: "Marca eliminada", variant: "success" })
      setDeleteConfirm(null)
      await reloadBrands()
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" })
    }
  }

  const handleUserDelete = async (id: string) => {
    try {
      const r = await deleteUser(id)
      if ("error" in r) throw new Error(r.error)
      toast({ title: "Usuario eliminado", variant: "success" })
      setDeleteConfirm(null)
      await reloadUsers()
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" })
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Configuración" />
      </div>
    )
  }

  if (userRole !== "ADMIN") {
    return (
      <div className="space-y-6">
        <PageHeader title="Configuración" />
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ShieldAlert className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-muted-foreground">
              Solo los usuarios con rol ADMIN pueden acceder a esta sección
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Configuración" description="Administración del sistema" />

      <Tabs defaultValue="usuarios">
        <TabsList>
          <TabsTrigger value="usuarios">Usuarios</TabsTrigger>
          <TabsTrigger value="categorias">Categorías</TabsTrigger>
          <TabsTrigger value="marcas">Marcas</TabsTrigger>
          <TabsTrigger value="servicios">Servicios</TabsTrigger>
          <TabsTrigger value="respaldos">Respaldos</TabsTrigger>
        </TabsList>

        <TabsContent value="usuarios">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Usuarios del sistema</CardTitle>
                <Button onClick={() => { setEditingUser(null); setUserDialog(true) }}>
                  <Plus className="mr-2 h-4 w-4" /> Agregar usuario
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.name}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>
                        <Badge variant={u.role === "ADMIN" ? "default" : "secondary"}>{u.role}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={u.active ? "success" : "destructive"}>
                          {u.active ? "Activo" : "Inactivo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => { setEditingUser(u); setUserDialog(true) }}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteConfirm({ type: "user", id: u.id, name: u.name })}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <UserForm
            open={userDialog}
            onOpenChange={setUserDialog}
            user={editingUser}
            onSuccess={reloadUsers}
          />
        </TabsContent>

        <TabsContent value="categorias">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Categorías y subcategorías</CardTitle>
                <Button onClick={openCatNew}>
                  <Plus className="mr-2 h-4 w-4" /> Agregar categoría
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Productos</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell>{c._count.products}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => openCatEdit(c)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteConfirm({ type: "category", id: c.id, name: c.name })}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Dialog open={catDialog} onOpenChange={setCatDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingCat ? "Editar categoría" : "Nueva categoría"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Nombre *</Label>
                  <Input value={catForm.name} onChange={(e) => setCatForm({ ...catForm, name: e.target.value })} />
                </div>
                <Button onClick={handleCatSave} className="w-full">Guardar</Button>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="marcas">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Marcas</CardTitle>
                <Button onClick={() => setBrandDialog(true)}>
                  <Plus className="mr-2 h-4 w-4" /> Agregar marca
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Productos</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {brands.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell className="font-medium">{b.name}</TableCell>
                      <TableCell>{b._count.products}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => setDeleteConfirm({ type: "brand", id: b.id, name: b.name })}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Dialog open={brandDialog} onOpenChange={setBrandDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nueva marca</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Nombre *</Label>
                  <Input value={brandName} onChange={(e) => setBrandName(e.target.value)} />
                </div>
                <Button onClick={handleBrandCreate} className="w-full">Guardar</Button>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="servicios">
          <Card>
            <CardHeader>
              <CardTitle>Servicios del taller</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {workshopServices.map((service) => (
                  <div key={service} className="flex items-center gap-3 rounded-lg border p-3">
                    <Wrench className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-sm">{service}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="respaldos">
          <Card>
            <CardHeader>
              <CardTitle>Respaldo de base de datos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border p-4 space-y-2">
                <h3 className="font-medium">Respaldo manual</h3>
                <p className="text-sm text-muted-foreground">
                  Para realizar un respaldo manual de la base de datos, ejecuta el siguiente comando:
                </p>
                <pre className="rounded bg-muted p-3 text-sm overflow-x-auto">
                  pg_dump -U usuario lubritotal_control &gt; respaldo_{new Date().toISOString().split("T")[0]}.sql
                </pre>
              </div>

              <div className="rounded-lg border p-4 space-y-2">
                <h3 className="font-medium">Restaurar respaldo</h3>
                <p className="text-sm text-muted-foreground">
                  Para restaurar un respaldo existente:
                </p>
                <pre className="rounded bg-muted p-3 text-sm overflow-x-auto">
                  psql -U usuario lubritotal_control &lt; respaldo.sql
                </pre>
              </div>

              <div className="rounded-lg border p-4 space-y-2">
                <h3 className="font-medium">Respaldo automático</h3>
                <p className="text-sm text-muted-foreground">
                  Se recomienda configurar un respaldo automático diario usando cron o el programador de tareas
                  de Windows para ejecutar el comando pg_dump automáticamente.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar {deleteConfirm?.name}?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Esta acción no se puede deshacer.</p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancelar</Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (!deleteConfirm) return
                if (deleteConfirm.type === "category") handleCatDelete(deleteConfirm.id)
                else if (deleteConfirm.type === "brand") handleBrandDelete(deleteConfirm.id)
                else if (deleteConfirm.type === "user") handleUserDelete(deleteConfirm.id)
              }}
            >
              Eliminar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

