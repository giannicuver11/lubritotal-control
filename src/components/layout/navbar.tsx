"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, User, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export function Navbar() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [user, setUser] = useState<{ name: string; role: string } | null>(null)

  useEffect(() => {
    setMounted(true)
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]))
        setUser({ name: payload.name, role: payload.role })
      } catch {
        // ignore
      }
    }
  }, [])

  const handleLogout = () => {
    document.cookie = "token=; path=/; max-age=0"
    router.push("/login")
  }

  if (!mounted) return null

  return (
    <header className="flex h-14 items-center justify-between border-b bg-card px-6">
      <div>
        <h1 className="text-lg font-semibold">Lubritotal Control</h1>
      </div>

      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2">
              <User className="h-4 w-4" />
              {user?.name || "Usuario"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>
              {user?.name}
              <span className="block text-xs font-normal text-muted-foreground capitalize">
                {user?.role === "admin"
                  ? "Administrador"
                  : user?.role === "vendedor"
                  ? "Vendedor"
                  : "Mecánico"}
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

