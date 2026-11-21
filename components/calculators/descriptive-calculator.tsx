"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalculationSteps, type Step } from "@/components/shared/calculation-steps"
import { CalculatorCard } from "@/components/shared/calculator-card"
import { CalculationStatus } from "@/components/shared/error-message"
import { ResultCard, type ResultItem } from "@/components/shared/result-card"
import { useDescriptiveStatistics } from "@/hooks/use-descriptive-statistics"
import { fmt, fmtUnambiguous, texNum } from "@/lib/formatters"
import type { CalculatorProps } from "./types"

const EXAMPLE = "2; 4; 4; 4; 5; 5; 7; 9"

export function DescriptiveCalculator({ decimals: d }: CalculatorProps) {
  const [text, setText] = useState("")
  const state = useDescriptiveStatistics(text)
  const r = state.result

  const items: ResultItem[] = r
    ? [
        { label: "Desvio padrão populacional (σ) — divide por n", value: fmt(r.populationSd, d), highlight: true },
        {
          label: "Desvio padrão amostral (s) — divide por n − 1",
          value: r.sampleSd === null ? "não definido (n = 1)" : fmt(r.sampleSd, d),
          highlight: true,
        },
        { label: "Quantidade de valores (n)", value: String(r.n) },
        { label: "Média (x̄)", value: fmt(r.mean, d) },
        { label: "Soma (Σx)", value: fmt(r.sum, d) },
        { label: "Σ(xi − x̄)²", value: fmt(r.sumSquares, d) },
        { label: "Variância populacional (σ²)", value: fmt(r.populationVariance, d) },
        { label: "Variância amostral (s²)", value: r.sampleVariance === null ? "não definida" : fmt(r.sampleVariance, d) },
      ]
    : []

  const steps: Step[] = r
    ? [
        {
          title: "Média",
          tex: String.raw`\bar{x} = \frac{\sum x_i}{n} = \frac{${texNum(r.sum)}}{${r.n}} = ${texNum(r.mean, d)}`,
        },
        {
          title: "Soma dos quadrados dos desvios (veja a tabela)",
          tex: String.raw`\sum (x_i - \bar{x})^2 = ${texNum(r.sumSquares, d)}`,
        },
        {
          title: "Desvio padrão populacional (divide por n)",
          tex: String.raw`\sigma = \sqrt{\frac{\sum (x_i - \bar{x})^2}{n}} = \sqrt{\frac{${texNum(r.sumSquares, d)}}{${r.n}}} = \sqrt{${texNum(r.populationVariance, d)}} = ${texNum(r.populationSd, d)}`,
        },
        ...(r.sampleVariance !== null && r.sampleSd !== null
          ? [
              {
                title: "Desvio padrão amostral (divide por n − 1)",
                tex: String.raw`s = \sqrt{\frac{\sum (x_i - \bar{x})^2}{n - 1}} = \sqrt{\frac{${texNum(r.sumSquares, d)}}{${r.n - 1}}} = \sqrt{${texNum(r.sampleVariance, d)}} = ${texNum(r.sampleSd, d)}`,
              },
            ]
          : []),
      ]
    : []

  return (
    <div className="flex flex-col gap-4">
      <div className="grid items-start gap-4 lg:grid-cols-2">
        <CalculatorCard
          title="Dados"
          description="Digite ou cole os valores observados."
          onExample={() => setText(EXAMPLE)}
          onReset={() => setText("")}
        >
          <div className="flex flex-col gap-1.5">
            <label htmlFor="values-list" className="text-sm font-medium">
              Valores (x)
            </label>
            <textarea
              id="values-list"
              rows={5}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={"ex.: 2; 4; 4; 4; 5; 5; 7; 9"}
              aria-invalid={state.error ? true : undefined}
              className="rounded-lg border border-input bg-transparent p-2 font-mono text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive dark:bg-input/30"
            />
            <p className="text-xs text-muted-foreground">
              Separe os valores com ponto e vírgula, espaço ou um por linha. Use vírgula para decimais (ex.: 1,5). Uma
              coluna copiada de planilha também funciona.
            </p>
            {state.values.length > 0 && !state.error && (
              <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                ✓ Lidos {state.values.length} valores:{" "}
                <span className="font-mono">{state.values.map((v) => fmtUnambiguous(v)).join(" ; ")}</span>
              </p>
            )}
          </div>
          <CalculationStatus {...state} emptyMessage="Informe os valores para calcular a média e o desvio padrão." />
        </CalculatorCard>

        {r && (
          <ResultCard
            summary={`média e desvio padrão de ${r.n} valores.`}
            items={items}
            interpretation={`Em média, os valores se afastam cerca de ${fmt(r.sampleSd ?? r.populationSd, d)} unidades da média ${fmt(r.mean, d)}.`}
          />
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>σ ou s: qual usar?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <strong>σ (populacional, divide por n):</strong> quando os dados são <em>a população inteira</em>, ou quando o
            enunciado já fornece o desvio da população (“o desvio padrão populacional é…”).
          </p>
          <p>
            <strong>s (amostral, divide por n − 1):</strong> quando os dados são <em>uma amostra</em> retirada da população,
            que é o caso mais comum nos exercícios de intervalo de confiança. No IC para a média, escolha “Amostral (s)”.
          </p>
          <p className="text-muted-foreground">
            Na dúvida, confira com a professora qual das duas divisões ela usa: as duas aparecem acima.
          </p>
        </CardContent>
      </Card>

      {r && (
        <Card>
          <CardHeader>
            <CardTitle>Tabela de desvios</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm tabular-nums">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="py-1.5 pr-4 font-medium">#</th>
                  <th className="py-1.5 pr-4 font-medium">xi</th>
                  <th className="py-1.5 pr-4 font-medium">xi − x̄</th>
                  <th className="py-1.5 font-medium">(xi − x̄)²</th>
                </tr>
              </thead>
              <tbody className="font-mono">
                {r.rows.map((row, i) => (
                  <tr key={i} className="border-b border-border/50">
                    <td className="py-1 pr-4 text-muted-foreground">{i + 1}</td>
                    <td className="py-1 pr-4">{fmtUnambiguous(row.x)}</td>
                    <td className="py-1 pr-4">{fmt(row.deviation, d)}</td>
                    <td className="py-1">{fmt(row.squared, d)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="font-mono font-semibold">
                <tr>
                  <td className="py-1.5 pr-4 font-sans">Σ</td>
                  <td className="py-1.5 pr-4">{fmt(r.sum, d)}</td>
                  <td className="py-1.5 pr-4">{fmt(0, d)}</td>
                  <td className="py-1.5">{fmt(r.sumSquares, d)}</td>
                </tr>
              </tfoot>
            </table>
          </CardContent>
        </Card>
      )}

      {r && <CalculationSteps steps={steps} />}
    </div>
  )
}
