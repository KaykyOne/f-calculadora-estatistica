"use client"

/**
 * CALCULADORA: TAMANHO DA AMOSTRA PARA PROPORÇÃO
 *   n = Zα/2² · p · (1 − p) / Ep²   → sempre arredondado para cima
 *
 * p e Ep podem ser digitados em decimal ou em %, conforme o seletor de unidade.
 * A conversão e os alertas de "unidade errada" ficam em hooks/use-sample-size-proportion.ts.
 */

import { Switch } from "@/components/ui/switch"
import { CalculatorCard } from "@/components/shared/calculator-card"
import { CalculationSteps, type Step } from "@/components/shared/calculation-steps"
import { ConfidenceLevelSelect } from "@/components/shared/confidence-level-select"
import { CalculationStatus } from "@/components/shared/error-message"
import { NumberField } from "@/components/shared/number-field"
import { ResultCard, type ResultItem } from "@/components/shared/result-card"
import { SegmentedControl } from "@/components/shared/segmented-control"
import { useForm } from "@/hooks/use-form"
import { useHistoryRecorder } from "@/hooks/use-history-recorder"
import { useSampleSizeProportion, type ProportionUnit } from "@/hooks/use-sample-size-proportion"
import { fmt, fmtPlain, fmtUnambiguous, texNum } from "@/lib/formatters"
import { SAMPLE_SIZE_PROPORTION_EMPTY, SAMPLE_SIZE_PROPORTION_EXAMPLE } from "./examples"
import { restoreForm, type CalculatorProps } from "./types"

/** Opções do seletor de unidade. */
const UNIT_OPTIONS: { value: ProportionUnit; label: string }[] = [
  { value: "decimal", label: "Decimal (0,30)" },
  { value: "percent", label: "Porcentagem (30%)" },
]

export function SampleSizeProportionCalculator({ decimals: d, calculatorId, initialForm }: CalculatorProps) {
  // ─── 1) Estado e cálculo ───
  const { form, set, setForm } = useForm(restoreForm(SAMPLE_SIZE_PROPORTION_EMPTY, initialForm))
  const state = useSampleSizeProportion(form)
  const r = state.result
  const pct = form.unit === "percent"

  /** "Lido como" mostrando as duas formas, ex.: "0,02 = 2%", para conferir com o enunciado. */
  const readAs = (v: number) => {
    const dec = pct ? v / 100 : v
    return `${fmtUnambiguous(dec)} = ${fmtUnambiguous(dec * 100)}%`
  }

  // ─── 2) Valores do card "Resultado" ───
  const items: ResultItem[] = r
    ? [
        { label: "Tamanho mínimo da amostra (n)", value: fmtPlain(r.n), highlight: true },
        { label: "Valor crítico Zα/2", value: fmt(r.z, 3) },
        { label: "Proporção considerada (p)", value: `${fmtUnambiguous(r.p)} (${fmtUnambiguous(r.p * 100)}%)` },
        { label: "Margem de erro (Ep)", value: `${fmtUnambiguous(r.margin)} (${fmtUnambiguous(r.margin * 100)}%)` },
        { label: "n antes do arredondamento", value: fmt(r.raw, d) },
      ]
    : []

  // ─── 3) Passo a passo ───
  const steps: Step[] = r
    ? [
        { title: "Fórmula", tex: String.raw`n = \frac{Z_{\alpha/2}^2 \cdot p \cdot (1 - p)}{E_p^2}` },
        {
          title: "Substituição",
          tex: String.raw`n = \frac{${texNum(r.z)}^2 \times ${texNum(r.p)} \times ${texNum(r.q)}}{${texNum(r.margin)}^2}`,
        },
        {
          title: "Operações intermediárias",
          tex: String.raw`Z^2 = ${texNum(r.zSquared)} \qquad p(1-p) = ${texNum(r.p * r.q)} \qquad E_p^2 = ${texNum(r.marginSquared)}`,
        },
        {
          title: "Divisão",
          tex: String.raw`n = \frac{${texNum(r.zSquared * r.p * r.q)}}{${texNum(r.marginSquared)}} = ${texNum(r.raw, d)}`,
        },
        {
          title: "Arredondamento para cima",
          tex: String.raw`n = \lceil ${texNum(r.raw, d)} \rceil = ${texNum(r.n)}`,
          text: "O tamanho da amostra é sempre arredondado para cima, para garantir a margem de erro desejada.",
        },
      ]
    : []

  // ─── Histórico: frase de conferência e resultado principal desta conta ───
  const summary = r ? `tamanho mínimo da amostra para estimar uma PROPORÇÃO, com p = ${fmtUnambiguous(r.p)}${form.unknownP ? " (desconhecida)" : ""}, Ep = ${fmtUnambiguous(r.margin)} (${fmtUnambiguous(r.margin * 100)}%) e ${form.level}% de confiança.` : ""
  useHistoryRecorder(calculatorId, r ? { form, summary, result: `n = ${fmtPlain(r.n)}` } : null)

  // ─── 4) Tela ───
  return (
    <div className="flex flex-col gap-4">
      <div className="grid items-start gap-4 lg:grid-cols-2">
        <CalculatorCard
          title="Parâmetros"
          description="Defina a precisão desejada para a estimativa da proporção."
          onExample={() => setForm(SAMPLE_SIZE_PROPORTION_EXAMPLE)}
          onReset={() => setForm(SAMPLE_SIZE_PROPORTION_EMPTY)}
        >
          <SegmentedControl label="Como o enunciado informa p e Ep?" value={form.unit} options={UNIT_OPTIONS} onChange={set("unit")} />
          <label className="flex items-center gap-2 text-sm">
            <Switch checked={form.unknownP} onCheckedChange={(checked) => set("unknownP")(checked)} />
            Não conheço a proporção esperada (usar p = 0,5)
          </label>
          {/* Com "proporção desconhecida", o campo fica travado mostrando 0,5 (ou 50%). */}
          <NumberField
            label="Proporção esperada"
            symbol="p"
            unit={pct ? "%" : undefined}
            placeholder={pct ? "ex.: 30" : "ex.: 0,30"}
            description={
              form.unknownP
                ? "Sem estimativa prévia, usa-se p = 0,5 (50%), que gera o maior tamanho de amostra."
                : "Proporção que se espera encontrar na população."
            }
            value={form.unknownP ? (pct ? "50" : "0,5") : form.p}
            onChange={set("p")}
            disabled={form.unknownP}
            error={form.unknownP ? undefined : state.fieldErrors.p}
            readAs={readAs}
          />
          <NumberField
            label="Margem de erro"
            symbol="Ep"
            unit={pct ? "%" : undefined}
            placeholder={pct ? "ex.: 2" : "ex.: 0,02"}
            description="Erro máximo aceitável na estimativa da proporção."
            value={form.margin}
            onChange={set("margin")}
            error={state.fieldErrors.margin}
            readAs={readAs}
          />
          <ConfidenceLevelSelect value={form.level} onChange={set("level")} />
          <CalculationStatus {...state} />
        </CalculatorCard>

        {r && (
          <ResultCard
            summary={summary}
            items={items}
            interpretation={`São necessárias pelo menos ${fmtPlain(r.n)} observações para estimar a proporção com margem de erro de ${fmtUnambiguous(r.margin * 100)}% e ${form.level}% de confiança.`}
          />
        )}
      </div>

      {r && <CalculationSteps steps={steps} />}
    </div>
  )
}
