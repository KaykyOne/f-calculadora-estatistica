"use client"

/**
 * CalculatorLayout — estrutura geral da página.
 *
 *   ┌──────────┬──────────────────────────────┐
 *   │ barra    │ cabeçalho (título, histórico,│
 *   │ lateral  │ decimais, tema)              │
 *   │          │ painel do histórico (aberto?)│
 *   │          │ calculadora selecionada      │
 *   └──────────┴──────────────────────────────┘
 * No celular, a barra lateral vira uma faixa de abas no topo.
 */

import { useState } from "react"
import { CALCULATORS, DEFAULT_CALCULATOR_ID } from "@/components/calculators/registry"
import { useHistory } from "@/hooks/use-history"
import type { Precision } from "@/lib/formatters"
import type { HistoryEntry } from "@/lib/history"
import { CalculatorHeader } from "./calculator-header"
import { CalculatorSidebar } from "./calculator-sidebar"
import { HistoryPanel } from "./history-panel"

/**
 * O que está aberto:
 * - id: aba selecionada
 * - preset: conta do histórico usada para preencher os campos (se houver)
 * - version: muda a cada troca, para a calculadora recomeçar com os novos dados
 */
interface View {
  id: string
  preset?: HistoryEntry
  version: number
}

export function CalculatorLayout() {
  const [view, setView] = useState<View>({ id: DEFAULT_CALCULATOR_ID, version: 0 })
  const [decimals, setDecimals] = useState<Precision>(4)
  const [historyOpen, setHistoryOpen] = useState(false)
  const history = useHistory()

  const active = CALCULATORS.find((c) => c.id === view.id) ?? CALCULATORS[0]
  const Active = active.component

  /** Troca de aba pela navegação (clicar na aba já aberta não apaga os campos). */
  const selectTab = (id: string) => setView((v) => (v.id === id ? v : { id, version: v.version + 1 }))

  /** Abre uma conta do histórico com os campos preenchidos. */
  const openEntry = (entry: HistoryEntry) => {
    setView((v) => ({ id: entry.calculatorId, preset: entry, version: v.version + 1 }))
    setHistoryOpen(false)
    window.scrollTo({ top: 0 })
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <CalculatorSidebar items={CALCULATORS} activeId={active.id} onSelect={selectTab} />
      <main className="mx-auto flex w-full max-w-6xl min-w-0 flex-1 flex-col gap-6 p-4 md:p-8">
        <CalculatorHeader
          title={active.title}
          description={active.description}
          decimals={decimals}
          onDecimalsChange={setDecimals}
          historyCount={history.length}
          historyOpen={historyOpen}
          onToggleHistory={() => setHistoryOpen((o) => !o)}
        />
        {historyOpen && <HistoryPanel entries={history} onOpen={openEntry} onClose={() => setHistoryOpen(false)} />}
        {/* key: ao trocar de aba ou abrir uma conta do histórico, a calculadora recomeça do zero. */}
        <Active
          key={`${active.id}-${view.version}`}
          calculatorId={active.id}
          decimals={decimals}
          initialForm={view.preset?.calculatorId === active.id ? view.preset.form : undefined}
        />
      </main>
    </div>
  )
}
