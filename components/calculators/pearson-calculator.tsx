"use client"

/**
 * CALCULADORA: CORRELAÇÃO DE PEARSON
 *   r = Σ(xi − x̄)(yi − ȳ) / √( Σ(xi − x̄)² · Σ(yi − ȳ)² )
 * Hook: hooks/use-pearson-correlation.ts · Fórmula: lib/statistics/correlation.ts
 */

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalculationSteps, type Step } from "@/components/shared/calculation-steps"
import { CalculatorCard } from "@/components/shared/calculator-card"
import { DataPairsTable, emptyRows } from "@/components/shared/data-pairs-table"
import { CalculationStatus } from "@/components/shared/error-message"
import { ResultCard, type ResultItem } from "@/components/shared/result-card"
import { ScatterChart } from "@/components/shared/scatter-chart"
import { usePearsonCorrelation } from "@/hooks/use-pearson-correlation"
import { fmt, fmtUnambiguous, texNum } from "@/lib/formatters"
import type { PairRow } from "@/lib/statistics/validation"
import { EXAMPLE_PAIRS } from "./examples"
import type { CalculatorProps } from "./types"

export function PearsonCalculator({ decimals: d }: CalculatorProps) {
  // ─── 1) Estado e cálculo ───
  const [rows, setRows] = useState<PairRow[]>(emptyRows)
  const state = usePearsonCorrelation(rows)
  const r = state.result

  // ─── 2) Valores do card "Resultado" ───
  const items: ResultItem[] = r
    ? [
        { label: "Coeficiente de Pearson (r)", value: fmt(r.r, d), highlight: true },
        { label: "Quantidade de pares (n)", value: String(r.n) },
        { label: "Média de X (x̄)", value: fmt(r.meanX, d) },
        { label: "Média de Y (ȳ)", value: fmt(r.meanY, d) },
        { label: "Σ(xi − x̄)(yi − ȳ)", value: fmt(r.sumXY, d) },
        { label: "Σ(xi − x̄)²", value: fmt(r.sumXX, d) },
        { label: "Σ(yi − ȳ)²", value: fmt(r.sumYY, d) },
      ]
    : []

  // ─── 3) Passo a passo ───
  const steps: Step[] = r
    ? [
        {
          title: "Fórmula",
          tex: String.raw`r = \frac{\sum (x_i - \bar{x})(y_i - \bar{y})}{\sqrt{\sum (x_i - \bar{x})^2 \cdot \sum (y_i - \bar{y})^2}}`,
        },
        {
          title: "Médias",
          tex: String.raw`\bar{x} = \frac{\sum x_i}{n} = ${texNum(r.meanX, d)} \qquad \bar{y} = \frac{\sum y_i}{n} = ${texNum(r.meanY, d)}`,
        },
        {
          title: "Somatórios dos desvios",
          tex: String.raw`\sum (x_i - \bar{x})(y_i - \bar{y}) = ${texNum(r.sumXY, d)} \quad \sum (x_i - \bar{x})^2 = ${texNum(r.sumXX, d)} \quad \sum (y_i - \bar{y})^2 = ${texNum(r.sumYY, d)}`,
        },
        {
          title: "Substituição",
          tex: String.raw`r = \frac{${texNum(r.sumXY, d)}}{\sqrt{${texNum(r.sumXX, d)} \times ${texNum(r.sumYY, d)}}} = \frac{${texNum(r.sumXY, d)}}{${texNum(Math.sqrt(r.sumXX * r.sumYY), d)}}`,
        },
        { title: "Resultado", tex: String.raw`r = ${texNum(r.r, d)}` },
        {
          title: "Classificação (|r|)",
          text: "|r| = 1: perfeita · 0,7 ≤ |r| < 1: forte · 0,3 ≤ |r| < 0,7: moderada · 0 < |r| < 0,3: fraca · r = 0: ausência de correlação linear.",
        },
      ]
    : []

  // ─── 4) Tela ───
  return (
    <div className="flex flex-col gap-4">
      <div className="grid items-start gap-4 lg:grid-cols-2">
        <CalculatorCard title="Dados" description="Informe os pares de valores observados (X, Y).">
          <DataPairsTable rows={rows} onChange={setRows} rowErrors={state.rowErrors} onExample={() => setRows(EXAMPLE_PAIRS)} />
          <CalculationStatus {...state} emptyMessage="Informe pelo menos dois pares completos para calcular r." />
        </CalculatorCard>

        <div className="flex flex-col gap-4">
          {r && (
            <ResultCard
              summary={`correlação de Pearson com ${r.n} pares (X de ${fmtUnambiguous(r.minX)} a ${fmtUnambiguous(r.maxX)}).`}
              items={items}
              interpretation={r.interpretation}
            />
          )}
          {/* O gráfico aparece assim que há algum par válido, mesmo antes de r existir. */}
          {state.pairs.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Diagrama de dispersão</CardTitle>
              </CardHeader>
              <CardContent>
                <ScatterChart points={state.pairs} />
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {r && <CalculationSteps steps={steps} />}
    </div>
  )
}
