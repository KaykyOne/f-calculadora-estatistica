"use client"

/**
 * CALCULADORA: INTERVALO DE CONFIANÇA PARA A MÉDIA
 *   Em = Zα/2 · σ/√n      IC = (x̄ − Em ; x̄ + Em)
 * Validação e alertas: hooks/use-mean-confidence-interval.ts
 * Fórmula: lib/statistics/confidence-intervals.ts
 */

import { CalculatorCard } from "@/components/shared/calculator-card"
import { CalculationSteps, type Step } from "@/components/shared/calculation-steps"
import { ConfidenceLevelSelect } from "@/components/shared/confidence-level-select"
import { CalculationStatus } from "@/components/shared/error-message"
import { NumberField } from "@/components/shared/number-field"
import { ResultCard, type ResultItem } from "@/components/shared/result-card"
import { SegmentedControl } from "@/components/shared/segmented-control"
import { useForm } from "@/hooks/use-form"
import { useMeanConfidenceInterval } from "@/hooks/use-mean-confidence-interval"
import { fmt, fmtUnambiguous, texNum } from "@/lib/formatters"
import type { DeviationType } from "@/lib/statistics/types"
import { MEAN_CI_EMPTY, MEAN_CI_EXAMPLE } from "./examples"
import type { CalculatorProps } from "./types"

/** Opções do seletor "Tipo de desvio padrão". */
const SD_OPTIONS: { value: DeviationType; label: string }[] = [
  { value: "population", label: "Populacional (σ)" },
  { value: "sample", label: "Amostral (s)" },
]

export function MeanConfidenceCalculator({ decimals: d }: CalculatorProps) {
  // ─── 1) Estado e cálculo ───
  const { form, set, setForm } = useForm(MEAN_CI_EMPTY)
  const state = useMeanConfidenceInterval(form)
  const r = state.result

  // O símbolo muda conforme o tipo de desvio escolhido (texto e LaTeX).
  const sdSym = form.sdType === "population" ? "σ" : "s"
  const sdTex = form.sdType === "population" ? String.raw`\sigma` : "s"

  // ─── 2) Valores do card "Resultado" ───
  const items: ResultItem[] = r
    ? [
        { label: "Intervalo de confiança", value: `(${fmt(r.lower, d)} ; ${fmt(r.upper, d)})`, highlight: true },
        { label: "Valor crítico Zα/2", value: fmt(r.z, 3) },
        { label: "Média (x̄)", value: fmt(r.mean, d) },
        { label: `Desvio padrão (${sdSym})`, value: fmt(r.sd, d) },
        { label: "Margem de erro (Em)", value: fmt(r.margin, d) },
        { label: "Limite inferior", value: fmt(r.lower, d) },
        { label: "Limite superior", value: fmt(r.upper, d) },
      ]
    : []

  // ─── 3) Passo a passo (mesma ordem da conta em confidence-intervals.ts) ───
  const steps: Step[] = r
    ? [
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
      ]
    : []

  // ─── 4) Tela ───
  return (
    <div className="flex flex-col gap-4">
      <div className="grid items-start gap-4 lg:grid-cols-2">
        <CalculatorCard
          title="Parâmetros"
          description="Informe os dados da amostra."
          onExample={() => setForm(MEAN_CI_EXAMPLE)}
          onReset={() => setForm(MEAN_CI_EMPTY)}
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
          <SegmentedControl label="Tipo de desvio padrão" value={form.sdType} options={SD_OPTIONS} onChange={set("sdType")} />
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
          <CalculationStatus {...state} />
        </CalculatorCard>

        {r && (
          <ResultCard
            summary={`intervalo de ${form.level}% de confiança para a MÉDIA, com x̄ = ${fmtUnambiguous(r.mean)}, ${sdSym} = ${fmtUnambiguous(r.sd)} e n = ${fmtUnambiguous(r.n)}.`}
            items={items}
            interpretation={`Com ${form.level}% de confiança, a média populacional μ está entre ${fmt(r.lower, d)} e ${fmt(r.upper, d)}.`}
          />
        )}
      </div>

      {r && <CalculationSteps steps={steps} />}
    </div>
  )
}
