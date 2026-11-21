import { useMemo } from "react"
import { fmtUnambiguous } from "@/lib/formatters"
import { sampleSizeProportion } from "@/lib/statistics/sample-size"
import { validateFields } from "@/lib/statistics/validation"
import type { CalcState, ConfidenceLevel, SampleSizeProportionResult } from "@/lib/statistics/types"

export type SampleSizeProportionField = "p" | "margin"

/** Como p e Ep são digitados: em porcentagem (30 = 0,30) ou em decimal (0,30). */
export type ProportionUnit = "percent" | "decimal"

export interface SampleSizeProportionForm {
  p: string
  margin: string
  unit: ProportionUnit
  unknownP: boolean
  level: ConfidenceLevel
}

/** Valor adotado pelo material quando a proporção é desconhecida. */
export const UNKNOWN_PROPORTION = 0.5

const NAMES: Record<SampleSizeProportionField, string> = { p: "p", margin: "Ep" }

export function useSampleSizeProportion(
  form: SampleSizeProportionForm,
): CalcState<SampleSizeProportionResult, SampleSizeProportionField> {
  const { p, margin, unit, unknownP, level } = form
  return useMemo(() => {
    const scale = unit === "percent" ? 100 : 1
    const open = { min: 0, minExclusive: true, max: scale, maxExclusive: true }
    const { values, errors, incomplete } = validateFields<SampleSizeProportionField>({
      p: { raw: unknownP ? String(UNKNOWN_PROPORTION * scale) : p, rule: open },
      margin: { raw: margin, rule: open },
    })

    // Valor ≥ 1 em modo decimal: provavelmente foi digitado em porcentagem.
    if (unit === "decimal")
      for (const key of ["p", "margin"] as const)
        if (errors[key]?.startsWith("Deve ser menor"))
          errors[key] = `Em decimal, ${NAMES[key]} deve ficar entre 0 e 1. Se você digitou em porcentagem, mude a unidade para %.`

    const base = { fieldErrors: errors, incomplete, warnings: [] as string[], error: null }
    if (!values) return { ...base, result: null }

    // Valor < 1 em modo %: provavelmente foi digitado em decimal (ex.: 0,02 em vez de 2%).
    const warnings: string[] = []
    if (unit === "percent")
      for (const key of ["p", "margin"] as const)
        if (!(key === "p" && unknownP) && values[key] < 1)
          warnings.push(
            `Você digitou ${NAMES[key]} = ${fmtUnambiguous(values[key])}%. Se o enunciado dá ${NAMES[key]} = ${fmtUnambiguous(values[key])} em decimal (${fmtUnambiguous(values[key] * 100)}%), mude a unidade para "decimal".`,
          )

    const res = sampleSizeProportion({
      p: unknownP ? UNKNOWN_PROPORTION : values.p / scale,
      margin: values.margin / scale,
      level,
    })
    return res.ok ? { ...base, result: res.data, warnings } : { ...base, result: null, error: res.error }
  }, [p, margin, unit, unknownP, level])
}
