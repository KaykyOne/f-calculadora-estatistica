"use client"

import { useState } from "react"
import { Switch } from "@/components/ui/switch"
import { CalculatorCard } from "@/components/shared/calculator-card"
import { CalculationSteps } from "@/components/shared/calculation-steps"
import { ConfidenceLevelSelect } from "@/components/shared/confidence-level-select"
import { CalculationStatus } from "@/components/shared/error-message"
import { NumberField } from "@/components/shared/number-field"
import { ResultCard } from "@/components/shared/result-card"
import {
  useSampleSizeProportion,
  type ProportionUnit,
  type SampleSizeProportionForm,
} from "@/hooks/use-sample-size-proportion"
import { SegmentedControl } from "@/components/shared/segmented-control"
import { fmt, fmtPlain, fmtUnambiguous, texNum } from "@/lib/formatters"
import type { CalculatorProps } from "./types"

const EMPTY: SampleSizeProportionForm = { p: "", margin: "", unit: "decimal", unknownP: false, level: 95 }
const EXAMPLE: SampleSizeProportionForm = { p: "0,30", margin: "0,02", unit: "decimal", unknownP: false, level: 95 }

const UNIT_OPTIONS: { value: ProportionUnit; label: string }[] = [
  { value: "decimal", label: "Decimal (0,30)" },
  { value: "percent", label: "Porcentagem (30%)" },
]

export function SampleSizeProportionCalculator({ decimals: d }: CalculatorProps) {
  const [form, setForm] = useState<SampleSizeProportionForm>(EMPTY)
  const state = useSampleSizeProportion(form)
  const r = state.result
  const set = <K extends keyof SampleSizeProportionForm>(key: K) => (value: SampleSizeProportionForm[K]) =>
    setForm((f) => ({ ...f, [key]: value }))
  const pct = form.unit === "percent"
  /** Mostra o valor nas duas formas, para conferir com o enunciado. */
  const readAs = (v: number) => {
    const dec = pct ? v / 100 : v
    return `${fmtUnambiguous(dec)} = ${fmtUnambiguous(dec * 100)}%`
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid items-start gap-4 lg:grid-cols-2">
        <CalculatorCard
          title="Parâmetros"
          description="Defina a precisão desejada para a estimativa da proporção."
          onExample={() => setForm(EXAMPLE)}
          onReset={() => setForm(EMPTY)}
        >
          <SegmentedControl
            label="Como o enunciado informa p e Ep?"
            value={form.unit}
            options={UNIT_OPTIONS}
            onChange={set("unit")}
          />
          <label className="flex items-center gap-2 text-sm">
            <Switch checked={form.unknownP} onCheckedChange={(checked) => set("unknownP")(checked)} />
            Não conheço a proporção esperada (usar p = 0,5)
          </label>
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
          <CalculationStatus {...state} hasFieldErrors={Object.keys(state.fieldErrors).length > 0} />
        </CalculatorCard>

        {r && (
          <ResultCard
            summary={`tamanho mínimo da amostra para estimar uma PROPORÇÃO, com p = ${fmtUnambiguous(r.p)}${form.unknownP ? " (desconhecida)" : ""}, Ep = ${fmtUnambiguous(r.margin)} (${fmtUnambiguous(r.margin * 100)}%) e ${form.level}% de confiança.`}
            items={[
              { label: "Tamanho mínimo da amostra (n)", value: fmtPlain(r.n), highlight: true },
              { label: "Valor crítico Zα/2", value: fmt(r.z, 3) },
              { label: "Proporção considerada (p)", value: `${fmtUnambiguous(r.p)} (${fmtUnambiguous(r.p * 100)}%)` },
              { label: "Margem de erro (Ep)", value: `${fmtUnambiguous(r.margin)} (${fmtUnambiguous(r.margin * 100)}%)` },
              { label: "n antes do arredondamento", value: fmt(r.raw, d) },
            ]}
            interpretation={`São necessárias pelo menos ${fmtPlain(r.n)} observações para estimar a proporção com margem de erro de ${fmtUnambiguous(r.margin * 100)}% e ${form.level}% de confiança.`}
          />
        )}
      </div>

      {r && (
        <CalculationSteps
          steps={[
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
          ]}
        />
      )}
    </div>
  )
}
