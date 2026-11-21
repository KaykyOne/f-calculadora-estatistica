"use client"

import { useState } from "react"
import { CalculatorCard } from "@/components/shared/calculator-card"
import { CalculationSteps } from "@/components/shared/calculation-steps"
import { ConfidenceLevelSelect } from "@/components/shared/confidence-level-select"
import { CalculationStatus } from "@/components/shared/error-message"
import { NumberField } from "@/components/shared/number-field"
import { ResultCard } from "@/components/shared/result-card"
import { SegmentedControl } from "@/components/shared/segmented-control"
import { useMeanConfidenceInterval, type MeanCIForm } from "@/hooks/use-mean-confidence-interval"
import { fmt, fmtUnambiguous, texNum } from "@/lib/formatters"
import type { DeviationType } from "@/lib/statistics/types"
import type { CalculatorProps } from "./types"

const EMPTY: MeanCIForm = { mean: "", sd: "", n: "", sdType: "population", level: 95 }
const SD_OPTIONS: { value: DeviationType; label: string }[] = [
  { value: "population", label: "Populacional (σ)" },
  { value: "sample", label: "Amostral (s)" },
]
const EXAMPLE: MeanCIForm = { mean: "320", sd: "45", n: "50", sdType: "population", level: 95 }

export function MeanConfidenceCalculator({ decimals: d }: CalculatorProps) {
  const [form, setForm] = useState<MeanCIForm>(EMPTY)
  const state = useMeanConfidenceInterval(form)
  const r = state.result
  const set = <K extends keyof MeanCIForm>(key: K) => (value: MeanCIForm[K]) => setForm((f) => ({ ...f, [key]: value }))
  const sdSym = form.sdType === "population" ? "σ" : "s"
  const sdTex = form.sdType === "population" ? String.raw`\sigma` : "s"

  return (
    <div className="flex flex-col gap-4">
      <div className="grid items-start gap-4 lg:grid-cols-2">
        <CalculatorCard
          title="Parâmetros"
          description="Informe os dados da amostra."
          onExample={() => setForm(EXAMPLE)}
          onReset={() => setForm(EMPTY)}
        >
          <NumberField
            label="Média amostral"
            symbol="x̄"
            placeholder="ex.: 320"
            description="Média calculada a partir dos dados da amostra."
            value={form.mean}
            onChange={set("mean")}
            error={state.fieldErrors.mean}
          />
          <SegmentedControl
            label="Tipo de desvio padrão"
            value={form.sdType}
            options={SD_OPTIONS}
            onChange={set("sdType")}
          />
          <NumberField
            label="Desvio padrão"
            symbol={sdSym}
            placeholder="ex.: 45"
            description={
              form.sdType === "population"
                ? "σ: dispersão conhecida da população."
                : "s: dispersão da amostra, usada como aproximação de σ quando n > 30."
            }
            value={form.sd}
            onChange={set("sd")}
            error={state.fieldErrors.sd}
          />
          <NumberField
            label="Tamanho da amostra"
            symbol="n"
            placeholder="ex.: 50"
            description="Quantidade de observações (inteiro positivo)."
            value={form.n}
            onChange={set("n")}
            error={state.fieldErrors.n}
          />
          <ConfidenceLevelSelect value={form.level} onChange={set("level")} />
          <CalculationStatus {...state} hasFieldErrors={Object.keys(state.fieldErrors).length > 0} />
        </CalculatorCard>

        {r && (
          <ResultCard
            summary={`intervalo de ${form.level}% de confiança para a MÉDIA, com x̄ = ${fmtUnambiguous(r.mean)}, ${sdSym} = ${fmtUnambiguous(r.sd)} e n = ${fmtUnambiguous(r.n)}.`}
            items={[
              { label: "Intervalo de confiança", value: `(${fmt(r.lower, d)} ; ${fmt(r.upper, d)})`, highlight: true },
              { label: "Valor crítico Zα/2", value: fmt(r.z, 3) },
              { label: "Média (x̄)", value: fmt(r.mean, d) },
              { label: `Desvio padrão (${sdSym})`, value: fmt(r.sd, d) },
              { label: "Margem de erro (Em)", value: fmt(r.margin, d) },
              { label: "Limite inferior", value: fmt(r.lower, d) },
              { label: "Limite superior", value: fmt(r.upper, d) },
            ]}
            interpretation={`Com ${form.level}% de confiança, a média populacional μ está entre ${fmt(r.lower, d)} e ${fmt(r.upper, d)}.`}
          />
        )}
      </div>

      {r && (
        <CalculationSteps
          steps={[
            {
              title: "Fórmulas",
              tex: String.raw`E_m = Z_{\alpha/2} \cdot \frac{${sdTex}}{\sqrt{n}} \qquad IC = (\bar{x} - E_m \;;\; \bar{x} + E_m)`,
            },
            {
              title: "Substituição",
              tex: String.raw`E_m = ${texNum(r.z)} \cdot \frac{${texNum(r.sd)}}{\sqrt{${texNum(r.n)}}}`,
            },
            {
              title: "Raiz de n e erro padrão",
              tex: String.raw`\sqrt{${texNum(r.n)}} = ${texNum(r.sqrtN, d)} \qquad \frac{${texNum(r.sd)}}{${texNum(r.sqrtN, d)}} = ${texNum(r.standardError, d)}`,
            },
            {
              title: "Margem de erro",
              tex: String.raw`E_m = ${texNum(r.z)} \times ${texNum(r.standardError, d)} = ${texNum(r.margin, d)}`,
            },
            {
              title: "Limites do intervalo",
              tex: String.raw`${texNum(r.mean)} - ${texNum(r.margin, d)} = ${texNum(r.lower, d)} \qquad ${texNum(r.mean)} + ${texNum(r.margin, d)} = ${texNum(r.upper, d)}`,
            },
            {
              title: "Resultado",
              tex: String.raw`IC_{${form.level}\%}(\mu) = (${texNum(r.lower, d)} \;;\; ${texNum(r.upper, d)})`,
            },
          ]}
        />
      )}
    </div>
  )
}
