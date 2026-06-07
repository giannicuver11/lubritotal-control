"use client"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface StockBadgeProps {
  stock: number
  minStock: number
  className?: string
}

export function StockBadge({ stock, minStock, className }: StockBadgeProps) {
  if (stock === 0) {
    return (
      <Badge variant="destructive" className={cn("whitespace-nowrap", className)}>
        Agotado
      </Badge>
    )
  }

  if (stock <= minStock) {
    return (
      <Badge variant="warning" className={cn("whitespace-nowrap", className)}>
        Stock Crítico
      </Badge>
    )
  }

  return (
    <Badge variant="success" className={cn("whitespace-nowrap", className)}>
      En Stock
    </Badge>
  )
}

