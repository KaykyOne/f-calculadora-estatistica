"use client"

import { useState } from "react"
import { CALCULATORS } from "@/components/calculators/registry"
import type { Precision } from "@/lib/formatters"
import { CalculatorHeader } from "./calculator-header"
import { CalculatorSidebar } from "./calculator-sidebar"

export function CalculatorLayout() {
  const [activeId, setActiveId] = useState(CALCULATORS[0].id)
  const [decimals, setDecimals] = useState<Precision>(4)
  const active = CALCULATORS.find((c) => c.id === activeId) ?? CALCULATORS[0]
  const Active = active.component

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <CalculatorSidebar items={CALCULATORS} activeId={active.id} onSelect={setActiveId} />
      <main className="mx-auto flex w-full max-w-6xl min-w-0 flex-1 flex-col gap-6 p-4 md:p-8">
        <CalculatorHeader
          title={active.title}
          description={active.description}
          decimals={decimals}
          onDecimalsChange={setDecimals}
        />
        {/* key: cada calculadora começa com o próprio estado ao ser aberta */}
        <Active key={active.id} decimals={decimals} />
      </main>
    </div>
  )
}
