"use client"

import { useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Search, X } from "lucide-react"

interface SearchBarProps {
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  debounceMs?: number
  className?: string
}

export function SearchBar({
  placeholder = "Buscar...",
  value: externalValue,
  onChange,
  debounceMs = 300,
  className,
}: SearchBarProps) {
  const [internalValue, setInternalValue] = useState(externalValue || "")
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (externalValue !== undefined) {
      setInternalValue(externalValue)
    }
  }, [externalValue])

  const handleChange = (value: string) => {
    setInternalValue(value)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      onChange?.(value)
    }, debounceMs)
  }

  const handleClear = () => {
    setInternalValue("")
    if (timerRef.current) clearTimeout(timerRef.current)
    onChange?.("")
  }

  return (
    <div className={cn("relative", className)}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder={placeholder}
        value={internalValue}
        onChange={(e) => handleChange(e.target.value)}
        className="pl-9 pr-9"
      />
      {internalValue && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}

