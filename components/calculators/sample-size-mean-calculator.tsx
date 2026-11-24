"use client"

/**
 * CALCULADORA: TAMANHO DA AMOSTRA PARA MÉDIA
 *   n = (Zα/2 · σ / Em)²   → sempre arredondado para cima
 * Validação: hooks/use-sample-size-mean.ts · Fórmula: lib/statistics/sample-size.ts
 */

import { CalculatorCard } from "@/components/shared/calculator-card"
import { CalculationSteps, type Step } from "@/components/shared/calculation-steps"
import { ConfidenceLevelSelect } from "@/components/shared/confidence-level-select"
import { CalculationStatus } from "@/components/shared/error-message"
import { NumberField } from "@/components/shared/number-field"
import { ResultCard, type ResultItem } from "@/components/shared/result-card"
import { useForm } from "@/hooks/use-form"
import { useSampleSizeMean } from "@/hooks/use-sample-size-mean"
import { fmt, fmtPlain, fmtUnambiguous, texNum } from "@/lib/formatters"
import { SAMPLE_SIZE_MEAN_EMPTY, SAMPLE_SIZE_MEAN_EXAMPLE } from "./examples"
import type { CalculatorProps } from "./types"

export function SampleSizeMeanCalculator({ decimals: d }: CalculatorProps) {
  // ─── 1) Estado e cálculo ───
  const { form, set, setForm } = useForm(SAMPLE_SIZE_MEAN_EMPTY)
  const state = useSampleSizeMean(form)
  const r = state.result

  // ─── 2) Valores do card "Resultado" ───
  const items: ResultItem[] = r
    ? [
        { label: "Tamanho mínimo da amostra (n)", value: fmtPlain(r.n), highlight: true },
        { label: "Valor crítico Zα/2", value: fmt(r.z, 3) },
        { label: "n antes do arredondamento", value: fmt(r.raw, d) },
      ]
    : []

  // ─── 3) Passo a passo ───
  const steps: Step[] = r
    ? [
        { title: "Fórmula", tex: String.raw`n = \left( \frac{Z_{\alpha/2} \cdot \sigma}{E_m} \right)^2` },
        { title: "Substituição", tex: String.raw`n = \left( \frac{${texNum(r.z)} \times ${texNum(r.sd)}}{${texNum(r.margin)}} \right)^2` },
        { title: "Razão interna", tex: String.raw`\frac{${texNum(r.z * r.sd)}}{${texNum(r.margin)}} = ${texNum(r.ratio, d)}` },
        { title: "Quadrado", tex: String.raw`n = ${texNum(r.ratio, d)}^2 = ${texNum(r.raw, d)}` },
        {
          title: "Arredondamento para cima",
          tex: String.raw`n = \lceil ${texNum(r.raw, d)} \rceil = ${texNum(r.n)}`,
          text: "O tamanho da amostra é sempre arredondado para cima, para garantir a margem de erro desejada.",
        },
      ]
    : []

  // ─── 4) Tela ───
  return (
    <div className="flex flex-col gap-4">
      <div className="grid items-start gap-4 lg:grid-cols-2">
        <CalculatorCard
          title="Parâmetros"
          description="Defina a precisão desejada para a estimativa da média."
          onExample={() => setForm(SAMPLE_SIZE_MEAN_EXAMPLE)}
          onReset={() => setForm(SAMPLE_SIZE_MEAN_EMPTY)}
        >
          <NumberField
            label="Desvio padrão populacional"
            symbol="σ"
            placeholder="ex.: 1250"
            description="Dispersão da população (maior que zero)."
            value={form.sd}
            onChange={set("sd")}
            error={state.fieldErrors.sd}
          />
          <NumberField
            label="Margem de erro máxima"
            symbol="Em"
            placeholder="ex.: 100"
            description="Maior diferença aceitável entre x̄ e μ, na mesma unidade dos dados."
            value={form.margin}
            onChange={set("margin")}
            error={state.fieldErrors.margin}
          />
          <ConfidenceLevelSelect value={form.level} onChange={set("level")} />
          <CalculationStatus {...state} />
        </CalculatorCard>

        {r && (
          <ResultCard
            summary={`tamanho mínimo da amostra para estimar uma MÉDIA, com σ = ${fmtUnambiguous(r.sd)}, Em = ${fmtUnambiguous(r.margin)} e ${form.level}% de confiança.`}
            items={items}
            interpretation={`São necessárias pelo menos ${fmtPlain(r.n)} observações para estimar a média com margem de erro de no máximo ${fmtPlain(r.margin)} e ${form.level}% de confiança.`}
          />
        )}
      </div>

      {r && <CalculationSteps steps={steps} />}
    </div>
  )
}
