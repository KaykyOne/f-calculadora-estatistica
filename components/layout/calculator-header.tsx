"use client"

/**
 * CalculatorHeader — título e descrição da aba aberta, botão do histórico,
 * seletor de casas decimais (2, 4 ou 6) e botão de tema claro/escuro.
 */

import { History, Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SegmentedControl } from "@/components/shared/segmented-control"
import { PRECISIONS, type Precision } from "@/lib/formatters"

interface CalculatorHeaderProps {
  title: string
  description: string
  decimals: Precision
  onDecimalsChange: (d: Precision) => void
  /** Quantidade de contas salvas (aparece no botão). */
  historyCount: number
  historyOpen: boolean
  onToggleHistory: () => void
}

const PRECISION_OPTIONS = PRECISIONS.map((p) => ({ value: p, label: String(p) }))

/**
 * Liga/desliga o tema escuro colocando a classe "dark" no <html> e salva a escolha.
 * O tema salvo é aplicado ao abrir a página pelo script em app/layout.tsx.
 */
function toggleTheme() {
  const dark = document.documentElement.classList.toggle("dark")
  localStorage.setItem("theme", dark ? "dark" : "light")
}

export function CalculatorHeader({
  title,
  description,
  decimals,
  onDecimalsChange,
  historyCount,
  historyOpen,
  onToggleHistory,
}: CalculatorHeaderProps) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="flex flex-wrap items-end gap-3">
        <Button variant={historyOpen ? "secondary" : "outline"} onClick={onToggleHistory} aria-expanded={historyOpen}>
          <History /> Histórico{historyCount > 0 && ` (${historyCount})`}
        </Button>
        <SegmentedControl label="Casas decimais" value={decimals} options={PRECISION_OPTIONS} onChange={onDecimalsChange} />
        <Button variant="outline" size="icon" onClick={toggleTheme} aria-label="Alternar tema claro/escuro">
          {/* O ícone troca só com CSS (classe dark:), sem precisar de estado. */}
          <Sun className="hidden dark:block" />
          <Moon className="dark:hidden" />
        </Button>
      </div>
    </header>
  )
}
