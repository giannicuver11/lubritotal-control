import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Correo inválido"),
  password: z.string().min(1, "Contraseña requerida"),
});

export const productSchema = z.object({
  code: z.string().min(1, "Código requerido"),
  name: z.string().min(1, "Nombre requerido"),
  categoryId: z.string().min(1, "Categoría requerida"),
  subcategoryId: z.string().optional(),
  brandId: z.string().optional(),
  buyPrice: z.coerce.number().min(0, "Precio inválido"),
  sellPrice: z.coerce.number().min(0, "Precio inválido"),
  stock: z.coerce.number().int().min(0, "Stock inválido"),
  minStock: z.coerce.number().int().min(0, "Stock mínimo inválido"),
  location: z.string().optional(),
  description: z.string().optional(),
});

export const clientSchema = z.object({
  name: z.string().min(1, "Nombre requerido"),
  rut: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  company: z.string().optional(),
  email: z.string().email("Correo inválido").optional().or(z.literal("")),
  notes: z.string().optional(),
});

export const vehicleSchema = z.object({
  plate: z.string().min(1, "Patente requerida"),
  brand: z.string().min(1, "Marca requerida"),
  model: z.string().min(1, "Modelo requerido"),
  year: z.coerce.number().int().optional(),
  mileage: z.coerce.number().int().optional(),
  clientId: z.string().min(1, "Cliente requerido"),
});

export const workOrderSchema = z.object({
  clientId: z.string().min(1, "Cliente requerido"),
  vehicleId: z.string().min(1, "Vehículo requerido"),
  mileage: z.coerce.number().int().optional(),
  diagnosis: z.string().optional(),
  workDone: z.string().optional(),
  laborCost: z.coerce.number().min(0).default(0),
  notes: z.string().optional(),
  status: z.enum(["PENDIENTE", "EN_PROCESO", "FINALIZADA", "ENTREGADA"]).optional(),
});

