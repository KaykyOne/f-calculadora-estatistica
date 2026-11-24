"use client"

/**
 * CALCULADORA: INTERVALO DE CONFIANÇA PARA PROPORÇÃO
 *   p = x/n      Ep = Zα/2 · √(p(1 − p)/n)      IC = (p − Ep ; p + Ep)
 * Validação e alertas: hooks/use-proportion-confidence-interval.ts
 * Fórmula: lib/statistics/confidence-intervals.ts
 */

import { CalculatorCard } from "@/components/shared/calculator-card"
import { CalculationSteps, type Step } from "@/components/shared/calculation-steps"
import { ConfidenceLevelSelect } from "@/components/shared/confidence-level-select"
import { CalculationStatus } from "@/components/shared/error-message"
import { NumberField } from "@/components/shared/number-field"
import { ResultCard, type ResultItem } from "@/components/shared/result-card"
import { useForm } from "@/hooks/use-form"
import { useHistoryRecorder } from "@/hooks/use-history-recorder"
import { useProportionConfidenceInterval } from "@/hooks/use-proportion-confidence-interval"
import { fmt, fmtPercent, fmtUnambiguous, texNum } from "@/lib/formatters"
import { PROPORTION_CI_EMPTY, PROPORTION_CI_EXAMPLE } from "./examples"
import { restoreForm, type CalculatorProps } from "./types"

export function ProportionConfidenceCalculator({ decimals: d, calculatorId, initialForm }: CalculatorProps) {
  // ─── 1) Estado e cálculo ───
  const { form, set, setForm } = useForm(restoreForm(PROPORTION_CI_EMPTY, initialForm))
  const state = useProportionConfidenceInterval(form)
  const r = state.result
  /** Casas das porcentagens: 2 a menos que os decimais (0,3194 → 31,94%). */
  const pd = Math.max(d - 2, 0)

  // ─── 2) Valores do card "Resultado" ───
  const items: ResultItem[] = r
    ? [
        {
          label: "Intervalo de confiança",
          value: `(${fmt(r.lower, d)} ; ${fmt(r.upper, d)})  ≈  (${fmtPercent(r.lower, pd)} ; ${fmtPercent(r.upper, pd)})`,
          highlight: true,
        },
        { label: "Proporção amostral (p)", value: fmt(r.p, d) },
        { label: "Complemento (1 − p)", value: fmt(r.q, d) },
        { label: "Valor crítico Zα/2", value: fmt(r.z, 3) },
        { label: "Margem de erro (Ep)", value: `${fmt(r.margin, d)} (${fmtPercent(r.margin, pd)})` },
        { label: "Limite inferior", value: fmt(r.lower, d) },
        { label: "Limite superior", value: fmt(r.upper, d) },
      ]
    : []

  // ─── 3) Passo a passo ───
  const steps: Step[] = r
    ? [
        {
          title: "Fórmulas",
          tex: String.raw`p = \frac{x}{n} \qquad E_p = Z_{\alpha/2} \cdot \sqrt{\frac{p(1-p)}{n}} \qquad IC = (p - E_p \;;\; p + E_p)`,
        },
        {
          title: "Proporção amostral",
          tex: String.raw`p = \frac{${texNum(r.successes)}}{${texNum(r.n)}} = ${texNum(r.p, d)} \qquad 1 - p = ${texNum(r.q, d)}`,
        },
        {
          title: "Substituição",
          tex: String.raw`E_p = ${texNum(r.z)} \cdot \sqrt{\frac{${texNum(r.p, d)} \times ${texNum(r.q, d)}}{${texNum(r.n)}}}`,
        },
        {
          title: "Variância e raiz",
          // A variância é pequena, por isso mostra 2 casas a mais.
          tex: String.raw`\frac{p(1-p)}{n} = ${texNum(r.variance, d + 2)} \qquad \sqrt{${texNum(r.variance, d + 2)}} = ${texNum(r.standardError, d)}`,
        },
        { title: "Margem de erro", tex: String.raw`E_p = ${texNum(r.z)} \times ${texNum(r.standardError, d)} = ${texNum(r.margin, d)}` },
        {
          title: "Limites",
          tex: String.raw`${texNum(r.p, d)} - ${texNum(r.margin, d)} = ${texNum(r.lower, d)} \qquad ${texNum(r.p, d)} + ${texNum(r.margin, d)} = ${texNum(r.upper, d)}`,
        },
        { title: "Resultado", tex: String.raw`IC_{${form.level}\%}(\pi) = (${texNum(r.lower, d)} \;;\; ${texNum(r.upper, d)})` },
        { title: "Precisão", text: "Os cálculos usam p com precisão completa; os valores acima são arredondados apenas na exibição." },
      ]
    : []

  // ─── Histórico: frase de conferência e resultado principal desta conta ───
  const summary = r ? `intervalo de ${form.level}% de confiança para a PROPORÇÃO, com ${fmtUnambiguous(r.successes)} sucessos em n = ${fmtUnambiguous(r.n)}.` : ""
  useHistoryRecorder(calculatorId, r ? { form, summary, result: `IC = (${fmt(r.lower, d)} ; ${fmt(r.upper, d)})` } : null)

  // ─── 4) Tela ───
  return (
    <div className="flex flex-col gap-4">
      <div className="grid items-start gap-4 lg:grid-cols-2">
        <CalculatorCard
          title="Parâmetros"
          description="Informe quantas observações apresentaram a característica de interesse."
          onExample={() => setForm(PROPORTION_CI_EXAMPLE)}
          onReset={() => setForm(PROPORTION_CI_EMPTY)}
        >
          <NumberField
            label="Número de sucessos"
            symbol="x"
            placeholder="ex.: 40"
            description="Observações com a característica estudada (inteiro entre 0 e n)."
            value={form.successes}
            onChange={set("successes")}
            error={state.fieldErrors.successes}
          />
          <NumberField
            label="Tamanho da amostra"
            symbol="n"
            placeholder="ex.: 100"
            description="Total de observações (inteiro positivo). Aceita 2200 ou 2.200."
            value={form.n}
            onChange={set("n")}
            error={state.fieldErrors.n}
          />
          <ConfidenceLevelSelect value={form.level} onChange={set("level")} />
          <CalculationStatus {...state} />
        </CalculatorCard>

        {r && (
          <ResultCard
            summary={summary}
            items={items}
            interpretation={`Com ${form.level}% de confiança, a proporção populacional π está entre ${fmtPercent(r.lower, pd)} e ${fmtPercent(r.upper, pd)}.`}
          />
        )}
      </div>

      {r && <CalculationSteps steps={steps} />}
    </div>
  )
}
