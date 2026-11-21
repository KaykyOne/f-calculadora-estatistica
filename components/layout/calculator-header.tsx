"use client"

import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SegmentedControl } from "@/components/shared/segmented-control"
import { PRECISIONS, type Precision } from "@/lib/formatters"

interface CalculatorHeaderProps {
  title: string
  description: string
  decimals: Precision
  onDecimalsChange: (d: Precision) => void
}

const PRECISION_OPTIONS = PRECISIONS.map((p) => ({ value: p, label: String(p) }))

function toggleTheme() {
  const dark = document.documentElement.classList.toggle("dark")
  localStorage.setItem("theme", dark ? "dark" : "light")
}

export function CalculatorHeader({ title, description, decimals, onDecimalsChange }: CalculatorHeaderProps) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="flex items-end gap-3">
        <SegmentedControl label="Casas decimais" value={decimals} options={PRECISION_OPTIONS} onChange={onDecimalsChange} />
        <Button variant="outline" size="icon" onClick={toggleTheme} aria-label="Alternar tema claro/escuro">
          <Sun className="hidden dark:block" />
          <Moon className="dark:hidden" />
        </Button>
      </div>
    </header>
  )
}
