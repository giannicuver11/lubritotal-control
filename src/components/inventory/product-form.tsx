"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import { productSchema } from "@/lib/validations"

type ProductFormValues = z.infer<typeof productSchema>

interface Category {
  id: string
  name: string
  subcategories?: { id: string; name: string }[]
}

interface Subcategory {
  id: string
  name: string
}

interface Brand {
  id: string
  name: string
}

interface Product {
  id: string
  code: string
  name: string
  description: string | null
  categoryId: string
  subcategoryId?: string | null
  brandId: string | null
  buyPrice: number
  sellPrice: number
  stock: number
  minStock: number
  location: string | null
  viscosity?: string | null
  technology?: string | null
  presentation?: string | null
  tireType?: string | null
  tireMeasure?: string | null
  amperage?: string | null
  voltage?: string | null
  engineType?: string | null
}

interface ProductFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product?: Product | null
  onSuccess?: () => void
}

const PRESENTACIONES = ["1L", "4L", "5L", "20L", "208L"]
const VISCOSIDADES = ["0W20", "0W30", "0W40", "5W20", "5W30", "5W40", "10W30", "10W40", "15W40", "20W50", "75W80", "75W90", "80W90", "85W140", "ATF", "CVTF", "ISO 32", "ISO 46", "ISO 68"]
const TECNOLOGIAS = ["Sintético", "Semi Sintético", "Mineral"]
const TIRE_TYPES = ["Touring", "Performance", "Premium", "HT", "AT", "MT", "Commercial"]
const AMPERAJES = ["45Ah", "55Ah", "60Ah", "65Ah", "75Ah", "90Ah", "100Ah", "150Ah"]
const VOLTAJES = ["12V", "24V"]

const CAT_ACEITES = "Aceites"
const CAT_FILTROS = "Filtros"
const CAT_NEUMATICOS = "Neumaticos"
const CAT_BATERIAS = "Baterias"

export function ProductForm({ open, onOpenChange, product, onSuccess }: ProductFormProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [saving, setSaving] = useState(false)
  const [catName, setCatName] = useState("")

  const isEditing = !!product

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      code: "", name: "", categoryId: "", subcategoryId: "", brandId: "",
      buyPrice: 0, sellPrice: 0, stock: 0, minStock: 0, location: "", description: "",
      viscosity: "", technology: "", presentation: "",
      tireType: "", tireMeasure: "", amperage: "", voltage: "", engineType: "",
    },
  })

  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = form
  const selectedCategoryId = watch("categoryId")

  useEffect(() => {
    if (!open) return
    fetch("/api/categories").then((r) => r.json()).then(setCategories).catch(() => {})
    fetch("/api/brands").then((r) => r.json()).then(setBrands).catch(() => {})
  }, [open])

  useEffect(() => {
    const url = selectedCategoryId
      ? `/api/brands?categoryId=${selectedCategoryId}`
      : "/api/brands"
    fetch(url).then((r) => r.json()).then(setBrands).catch(() => {})
    if (selectedCategoryId) {
      const cat = categories.find((c) => c.id === selectedCategoryId)
      setCatName(cat?.name || "")
    } else {
      setCatName("")
    }
  }, [selectedCategoryId, categories])

  useEffect(() => {
    if (!open) return
    if (product) {
      reset({
        code: product.code,
        name: product.name,
        categoryId: product.categoryId,
        subcategoryId: product.subcategoryId || "",
        brandId: product.brandId || "",
        buyPrice: product.buyPrice,
        sellPrice: product.sellPrice,
        stock: product.stock,
        minStock: product.minStock,
        location: product.location || "",
        description: product.description || "",
        viscosity: product.viscosity || "",
        technology: product.technology || "",
        presentation: product.presentation || "",
        tireType: product.tireType || "",
        tireMeasure: product.tireMeasure || "",
        amperage: product.amperage || "",
        voltage: product.voltage || "",
        engineType: product.engineType || "",
      })
      loadSubcategories(product.categoryId)
      const cat = categories.find((c) => c.id === product.categoryId)
      setCatName(cat?.name || "")
    } else {
      reset({
        code: "", name: "", categoryId: "", subcategoryId: "", brandId: "",
        buyPrice: 0, sellPrice: 0, stock: 0, minStock: 0, location: "", description: "",
        viscosity: "", technology: "", presentation: "",
        tireType: "", tireMeasure: "", amperage: "", voltage: "", engineType: "",
      })
      setSubcategories([])
      setCatName("")
    }
  }, [product, open, reset, categories])

  const loadSubcategories = async (categoryId: string) => {
    if (!categoryId) { setSubcategories([]); return }
    try {
      const res = await fetch(`/api/categories?id=${categoryId}`)
      const cat = await res.json()
      setSubcategories(cat.subcategories || [])
    } catch {
      setSubcategories([])
    }
  }

  useEffect(() => {
    if (selectedCategoryId) {
      loadSubcategories(selectedCategoryId)
      setValue("subcategoryId", "")
    } else {
      setSubcategories([])
    }
  }, [selectedCategoryId])

  const onSubmit = async (data: ProductFormValues) => {
    setSaving(true)
    try {
      const url = isEditing ? `/api/products/${product.id}` : "/api/products"
      const method = isEditing ? "PUT" : "POST"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          subcategoryId: data.subcategoryId || null,
          brandId: data.brandId || null,
          viscosity: data.viscosity || null,
          technology: data.technology || null,
          presentation: data.presentation || null,
          tireType: data.tireType || null,
          tireMeasure: data.tireMeasure || null,
          amperage: data.amperage || null,
          voltage: data.voltage || null,
          engineType: data.engineType || null,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Error al guardar")
      }
      toast({
        title: isEditing ? "Producto actualizado" : "Producto creado",
        variant: "success",
      })
      onOpenChange(false)
      onSuccess?.()
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const isCat = (name: string) => catName.toLowerCase() === name.toLowerCase()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Producto" : "Agregar Producto"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">Código *</Label>
              <Input id="code" {...register("code")} />
              {errors.code && <p className="text-xs text-destructive">{errors.code.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Nombre *</Label>
              <Input id="name" {...register("name")} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Categoría *</Label>
              <Select
                value={watch("categoryId")}
                onValueChange={(v) => setValue("categoryId", v, { shouldValidate: true })}
              >
                <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.categoryId && <p className="text-xs text-destructive">{errors.categoryId.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Subcategoría</Label>
              <Select
                value={watch("subcategoryId") || ""}
                onValueChange={(v) => setValue("subcategoryId", v)}
              >
                <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                <SelectContent>
                  {subcategories.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Marca</Label>
              <Select
                value={watch("brandId") || ""}
                onValueChange={(v) => setValue("brandId", v)}
              >
                <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                <SelectContent>
                  {brands.map((b) => (
                    <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Ubicación</Label>
              <Input id="location" {...register("location")} placeholder="Ej: Rack A-A01" />
            </div>
          </div>

          {isCat(CAT_ACEITES) && (
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Viscosidad</Label>
                <Select
                  value={watch("viscosity") || ""}
                  onValueChange={(v) => setValue("viscosity", v)}
                >
                  <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                  <SelectContent>
                    {VISCOSIDADES.map((v) => (
                      <SelectItem key={v} value={v}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tecnología</Label>
                <Select
                  value={watch("technology") || ""}
                  onValueChange={(v) => setValue("technology", v)}
                >
                  <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                  <SelectContent>
                    {TECNOLOGIAS.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Presentación</Label>
                <Select
                  value={watch("presentation") || ""}
                  onValueChange={(v) => setValue("presentation", v)}
                >
                  <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                  <SelectContent>
                    {PRESENTACIONES.map((p) => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {isCat(CAT_FILTROS) && (
            <div className="space-y-2">
              <Label htmlFor="engineType">Motor Compatible</Label>
              <Input id="engineType" {...register("engineType")} placeholder="Ej: 2.4 Diesel" />
            </div>
          )}

          {isCat(CAT_NEUMATICOS) && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select
                  value={watch("tireType") || ""}
                  onValueChange={(v) => setValue("tireType", v)}
                >
                  <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                  <SelectContent>
                    {TIRE_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tireMeasure">Medida</Label>
                <Input id="tireMeasure" {...register("tireMeasure")} placeholder="Ej: 225/65R17" />
              </div>
            </div>
          )}

          {isCat(CAT_BATERIAS) && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Amperaje</Label>
                <Select
                  value={watch("amperage") || ""}
                  onValueChange={(v) => setValue("amperage", v)}
                >
                  <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                  <SelectContent>
                    {AMPERAJES.map((a) => (
                      <SelectItem key={a} value={a}>{a}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Voltaje</Label>
                <Select
                  value={watch("voltage") || ""}
                  onValueChange={(v) => setValue("voltage", v)}
                >
                  <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                  <SelectContent>
                    {VOLTAJES.map((v) => (
                      <SelectItem key={v} value={v}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="buyPrice">Precio Compra</Label>
              <Input id="buyPrice" type="number" step="1" {...register("buyPrice", { valueAsNumber: true })} />
              {errors.buyPrice && <p className="text-xs text-destructive">{errors.buyPrice.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="sellPrice">Precio Venta</Label>
              <Input id="sellPrice" type="number" step="1" {...register("sellPrice", { valueAsNumber: true })} />
              {errors.sellPrice && <p className="text-xs text-destructive">{errors.sellPrice.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stock">Stock</Label>
              <Input id="stock" type="number" {...register("stock", { valueAsNumber: true })} disabled={isEditing} />
              {errors.stock && <p className="text-xs text-destructive">{errors.stock.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="minStock">Stock Mínimo</Label>
              <Input id="minStock" type="number" {...register("minStock", { valueAsNumber: true })} />
              {errors.minStock && <p className="text-xs text-destructive">{errors.minStock.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea id="description" {...register("description")} rows={3} />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Guardando..." : isEditing ? "Guardar Cambios" : "Crear Producto"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
