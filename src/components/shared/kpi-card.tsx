"use client"

import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface KPICardProps {
  title: string
  value: string
  icon?: ReactNode
  trend?: {
    value: number
    direction: "up" | "down" | "neutral"
  }
  variant?: "default" | "primary" | "success" | "warning" | "danger"
  className?: string
}

const variantStyles = {
  default: "bg-card",
  primary: "bg-primary/5 border-primary/20",
  success: "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800",
  warning: "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800",
  danger: "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800",
}

const iconStyles = {
  default: "text-primary",
  primary: "text-primary",
  success: "text-green-600 dark:text-green-400",
  warning: "text-yellow-600 dark:text-yellow-400",
  danger: "text-red-600 dark:text-red-400",
}

export function KPICard({
  title,
  value,
  icon,
  trend,
  variant = "default",
  className,
}: KPICardProps) {
  const TrendIcon =
    trend?.direction === "up"
      ? TrendingUp
      : trend?.direction === "down"
      ? TrendingDown
      : Minus

  const trendColor =
    trend?.direction === "up"
      ? "text-green-600 dark:text-green-400"
      : trend?.direction === "down"
      ? "text-red-600 dark:text-red-400"
      : "text-muted-foreground"

  return (
    <Card className={cn(variantStyles[variant], className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          {icon && (
            <div className={cn("rounded-full p-2", iconStyles[variant])}>
              {icon}
            </div>
          )}
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <p className="text-2xl font-bold">{value}</p>
          {trend && (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 text-sm font-medium",
                trendColor
              )}
            >
              <TrendIcon className="h-3.5 w-3.5" />
              {Math.abs(trend.value)}%
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

