export type Role = "ADMIN" | "VENDEDOR" | "MECANICO";

export type OrderStatus = "PENDIENTE" | "EN_PROCESO" | "FINALIZADA" | "ENTREGADA";

export type MovementType = "ENTRADA" | "SALIDA" | "AJUSTE";

export interface CartItem {
  productId: string;
  code: string;
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
  stock: number;
}

