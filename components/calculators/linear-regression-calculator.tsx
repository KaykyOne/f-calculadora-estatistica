"use client"

/**
 * CALCULADORA: REGRESSÃO LINEAR SIMPLES
 *   ŷ = a·x + b      a = Σ(xi − x̄)(yi − ȳ) / Σ(xi − x̄)²      b = ȳ − a·x̄
 * Hook (com previsão e alerta de extrapolação): hooks/use-linear-regression.ts
 * Fórmula: lib/statistics/regression.ts
 */

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalculationSteps, type Step } from "@/components/shared/calculation-steps"
import { CalculatorCard } from "@/components/shared/calculator-card"
import { DataPairsTable, emptyRows } from "@/components/shared/data-pairs-table"
import { CalculationStatus, ErrorMessage } from "@/components/shared/error-message"
import { NumberField } from "@/components/shared/number-field"
import { ResultCard, type ResultItem } from "@/components/shared/result-card"
import { ScatterChart } from "@/components/shared/scatter-chart"
import { useLinearRegression } from "@/hooks/use-linear-regression"
import { fmt, fmtPercent, fmtUnambiguous, texNum } from "@/lib/formatters"
import type { PairRow } from "@/lib/statistics/validation"
import { EXAMPLE_PAIRS, REGRESSION_EXAMPLE_X } from "./examples"
import type { CalculatorProps } from "./types"

/**
 * Monta a equação da reta com o sinal certo: "ŷ = 0,6x − 33,3333" (e não "+ −33,3333").
 * asTex = true devolve a versão para KaTeX.
 */
function equation(a: number, b: number, d: number, asTex = false): string {
  const num = (v: number) => (asTex ? texNum(v, d) : fmt(v, d))
  const sign = b < 0 ? (asTex ? "-" : "−") : "+"
  return `${asTex ? String.raw`\hat{y}` : "ŷ"} = ${num(a)}x ${sign} ${num(Math.abs(b))}`
}

export function LinearRegressionCalculator({ decimals: d }: CalculatorProps) {
  // ─── 1) Estado e cálculo ───
  const [rows, setRows] = useState<PairRow[]>(emptyRows)
  const [predictX, setPredictX] = useState("")
  const state = useLinearRegression(rows, predictX)
  const r = state.result
  const pred = state.prediction

  // ─── 2) Valores do card "Resultado" ───
  const items: ResultItem[] = r
    ? [
        { label: "Equação da reta", value: equation(r.a, r.b, d), highlight: true },
        { label: "Coeficiente angular (a)", value: fmt(r.a, d) },
        { label: "Intercepto (b)", value: fmt(r.b, d) },
        { label: "Média de X (x̄)", value: fmt(r.meanX, d) },
        { label: "Média de Y (ȳ)", value: fmt(r.meanY, d) },
        { label: "Pearson (r)", value: r.r === null ? "não definido" : fmt(r.r, d) },
        { label: "Determinação (R²)", value: r.rSquared === null ? "não definido" : fmt(r.rSquared, d) },
        // A previsão só entra se o usuário digitou um x.
        ...(pred ? [{ label: `Previsão ŷ para x = ${fmt(pred.x, d)}`, value: fmt(pred.y, d), highlight: true }] : []),
      ]
    : []

  const interpretation = r
    ? [
        `A cada aumento de 1 unidade em X, Y ${r.a >= 0 ? "aumenta" : "diminui"} em média ${fmt(Math.abs(r.a), d)} unidades.`,
        r.rSquared !== null ? `A reta explica ${fmtPercent(r.rSquared, 2)} da variação de Y (R²).` : "",
      ]
        .filter(Boolean)
        .join(" ")
    : undefined

  // ─── 3) Passo a passo ───
  const steps: Step[] = r
    ? [
        {
          title: "Fórmulas (mínimos quadrados)",
          tex: String.raw`a = \frac{\sum (x_i - \bar{x})(y_i - \bar{y})}{\sum (x_i - \bar{x})^2} \qquad b = \bar{y} - a\,\bar{x}`,
        },
        { title: "Médias", tex: String.raw`\bar{x} = ${texNum(r.meanX, d)} \qquad \bar{y} = ${texNum(r.meanY, d)}` },
        { title: "Coeficiente angular", tex: String.raw`a = \frac{${texNum(r.sumXY, d)}}{${texNum(r.sumXX, d)}} = ${texNum(r.a, d)}` },
        {
          title: "Intercepto",
          tex: String.raw`b = ${texNum(r.meanY, d)} - ${texNum(r.a, d)} \times ${texNum(r.meanX, d, true)} = ${texNum(r.b, d)}`,
        },
        { title: "Equação da reta", tex: equation(r.a, r.b, d, true) },
        // R² só quando r existe (Y varia).
        ...(r.r !== null && r.rSquared !== null
          ? [{ title: "Coeficiente de determinação", tex: String.raw`R^2 = r^2 = ${texNum(r.r, d, true)}^2 = ${texNum(r.rSquared, d)}` }]
          : []),
        ...(pred
          ? [
              {
                title: "Previsão",
                tex: String.raw`\hat{y} = ${texNum(r.a, d)} \times ${texNum(pred.x, undefined, true)} ${r.b < 0 ? "-" : "+"} ${texNum(Math.abs(r.b), d)} = ${texNum(pred.y, d)}`,
              },
            ]
          : []),
      ]
    : []

  // ─── 4) Tela ───
  return (
    <div className="flex flex-col gap-4">
      <div className="grid items-start gap-4 lg:grid-cols-2">
        <CalculatorCard title="Dados" description="Informe os pares observados e, se quiser, um valor de X para previsão.">
          <DataPairsTable
            rows={rows}
            onChange={setRows}
            rowErrors={state.rowErrors}
            onExample={() => {
              setRows(EXAMPLE_PAIRS)
              setPredictX(REGRESSION_EXAMPLE_X)
            }}
          />
          <NumberField
            label="Valor de X para previsão (opcional)"
            symbol="x"
            placeholder="ex.: 350"
            description="Calcula ŷ = a·x + b para este valor."
            value={predictX}
            onChange={setPredictX}
            error={state.predictionError ?? undefined}
          />
          <CalculationStatus {...state} emptyMessage="Informe pelo menos dois pares completos para ajustar a reta." />
        </CalculatorCard>

        <div className="flex flex-col gap-4">
          {r && (
            <ResultCard
              summary={`regressão linear com ${r.n} pares (X de ${fmtUnambiguous(r.minX)} a ${fmtUnambiguous(r.maxX)})${pred ? `, prevendo ŷ para x = ${fmtUnambiguous(pred.x)}` : ""}.`}
              items={items}
              interpretation={interpretation}
            />
          )}
          {state.pairs.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Dispersão e reta de regressão</CardTitle>
              </CardHeader>
              <CardContent>
                {/* A reta é desenhada só no intervalo observado de X. */}
                <ScatterChart points={state.pairs} line={r ? { a: r.a, b: r.b, fromX: r.minX, toX: r.maxX } : undefined} />
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {r && <CalculationSteps steps={steps} />}

      {/* Observação educacional exigida no enunciado do projeto. */}
      <ErrorMessage variant="info">
        Correlação não implica causalidade: uma relação linear forte não prova que X cause Y. Além disso, a regressão
        linear simples descreve apenas tendências lineares e pode não representar bem relações não lineares.
      </ErrorMessage>
    </div>
  )
}
