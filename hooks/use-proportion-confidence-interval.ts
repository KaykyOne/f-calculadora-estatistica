import { useMemo } from "react"
import { proportionConfidenceInterval, proportionWarnings } from "@/lib/statistics/confidence-intervals"
import { validateFields } from "@/lib/statistics/validation"
import type { CalcState, ConfidenceLevel, ProportionCIResult } from "@/lib/statistics/types"

export type ProportionCIField = "successes" | "n"

export interface ProportionCIForm {
  successes: string
  n: string
  level: ConfidenceLevel
}

export function useProportionConfidenceInterval(
  form: ProportionCIForm,
): CalcState<ProportionCIResult, ProportionCIField> {
  const { successes, n, level } = form
  return useMemo(() => {
    const { values, errors, incomplete } = validateFields<ProportionCIField>({
      successes: { raw: successes, rule: { integer: true, min: 0 } },
      n: { raw: n, rule: { integer: true, min: 0, minExclusive: true } },
    })
    const base = { fieldErrors: errors, incomplete, warnings: [] as string[], error: null }
    if (!values) return { ...base, result: null }
    if (values.successes > values.n)
      return { ...base, result: null, fieldErrors: { successes: "Não pode ser maior que o tamanho da amostra (n)." } }

    const res = proportionConfidenceInterval({ ...values, level })
    if (!res.ok) return { ...base, result: null, error: res.error }
    return { ...base, result: res.data, warnings: proportionWarnings(res.data) }
  }, [successes, n, level])
}
