"use client"

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

const CHART_COLORS = [
  "hsl(var(--primary))",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#f97316",
  "#ec4899",
]

function useMounted() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  return mounted
}

function getThemeColors(resolvedTheme?: string) {
  const isDark = resolvedTheme === "dark"
  return {
    text: isDark ? "#a1a1aa" : "#71717a",
    grid: isDark ? "#27272a" : "#e4e4e7",
    tooltipBg: isDark ? "#18181b" : "#ffffff",
    tooltipBorder: isDark ? "#27272a" : "#e4e4e7",
  }
}

interface SalesLineChartProps {
  data: { date: string; total: number }[]
}

export function SalesLineChart({ data }: SalesLineChartProps) {
  const { resolvedTheme } = useTheme()
  const mounted = useMounted()
  const colors = getThemeColors(resolvedTheme)

  if (!mounted) return null

  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
        <XAxis
          dataKey="date"
          tick={{ fill: colors.text, fontSize: 12 }}
          tickLine={{ stroke: colors.grid }}
          axisLine={{ stroke: colors.grid }}
        />
        <YAxis
          tick={{ fill: colors.text, fontSize: 12 }}
          tickLine={{ stroke: colors.grid }}
          axisLine={{ stroke: colors.grid }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: colors.tooltipBg,
            border: `1px solid ${colors.tooltipBorder}`,
            borderRadius: "8px",
            fontSize: "12px",
          }}
        />
        <Line
          type="monotone"
          dataKey="total"
          stroke={CHART_COLORS[0]}
          strokeWidth={2}
          dot={{ fill: CHART_COLORS[0], r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

interface TopProductsBarChartProps {
  data: { name: string; total: number }[]
}

export function TopProductsBarChart({ data }: TopProductsBarChartProps) {
  const { resolvedTheme } = useTheme()
  const mounted = useMounted()
  const colors = getThemeColors(resolvedTheme)

  if (!mounted) return null

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
        <XAxis type="number" tick={{ fill: colors.text, fontSize: 12 }} />
        <YAxis
          dataKey="name"
          type="category"
          tick={{ fill: colors.text, fontSize: 12 }}
          width={120}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: colors.tooltipBg,
            border: `1px solid ${colors.tooltipBorder}`,
            borderRadius: "8px",
            fontSize: "12px",
          }}
        />
        <Bar dataKey="total" fill={CHART_COLORS[0]} radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

interface CategoryPieChartProps {
  data: { name: string; total: number }[]
}

export function CategoryPieChart({ data }: CategoryPieChartProps) {
  const { resolvedTheme } = useTheme()
  const mounted = useMounted()
  const colors = getThemeColors(resolvedTheme)

  if (!mounted) return null

  return (
    <ResponsiveContainer width="100%" height={350}>
      <PieChart>
        <Pie
          data={data}
          dataKey="total"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={120}
          innerRadius={60}
          paddingAngle={3}
        >
          {data.map((_, index) => (
            <Cell
              key={`cell-${index}`}
              fill={CHART_COLORS[index % CHART_COLORS.length]}
            />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: colors.tooltipBg,
            border: `1px solid ${colors.tooltipBorder}`,
            borderRadius: "8px",
            fontSize: "12px",
          }}
        />
        <Legend
          formatter={(value) => (
            <span style={{ color: colors.text, fontSize: "12px" }}>{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}

