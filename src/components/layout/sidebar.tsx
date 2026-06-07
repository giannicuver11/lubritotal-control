"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Truck,
  Wrench,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react"
import { useSidebar } from "./app-shell"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"

const menuItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/inventario", label: "Inventario", icon: Package },
  { href: "/ventas", label: "Ventas", icon: ShoppingCart },
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/vehiculos", label: "Vehículos", icon: Truck },
  { href: "/ordenes", label: "Órdenes de Trabajo", icon: Wrench },
  { href: "/reportes", label: "Reportes", icon: BarChart3 },
  { href: "/configuracion", label: "Configuración", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { collapsed, setCollapsed } = useSidebar()
  const { data: session } = useSession()

  const user = session?.user

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-30 flex h-screen flex-col border-r bg-card transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-14 items-center border-b px-3">
        {collapsed ? (
          <Link href="/dashboard" className="mx-auto">
            <Image
              src="/logo/logo.png"
              alt="Lubritotal"
              width={28}
              height={28}
              className="rounded-full"
            />
          </Link>
        ) : (
          <Link href="/dashboard" className="flex items-center gap-2">
            <Image
              src="/logo/logo.png"
              alt="Lubritotal"
              width={32}
              height={32}
              className="rounded-full"
            />
            <span className="font-bold text-sm">Lubritotal Control</span>
          </Link>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-2">
        {menuItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent hover:text-accent-foreground",
                collapsed && "justify-center px-2"
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      <Separator />

      <div className="p-2">
        {!collapsed && (
          <div className="mb-2 px-3 py-2">
            <p className="text-sm font-medium truncate">{user?.name || "Usuario"}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email || ""}</p>
          </div>
        )}
        <div className="flex items-center gap-1">
          {!collapsed && (
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 justify-start gap-2 text-muted-foreground"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              <LogOut className="h-4 w-4" />
              Cerrar sesión
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto"
          >
            {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </Button>
        </div>
      </div>
    </aside>
  )
}

