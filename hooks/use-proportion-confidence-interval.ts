/**
 * useProportionConfidenceInterval — IC para proporção.
 * Lê x (sucessos) e n, valida, chama a fórmula e gera os alertas da aproximação normal.
 */

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
    // 1) Valida: os dois inteiros, x ≥ 0 e n > 0.
    const { values, errors, incomplete } = validateFields<ProportionCIField>({
      successes: { raw: successes, rule: { integer: true, min: 0 } },
      n: { raw: n, rule: { integer: true, min: 0, minExclusive: true } },
    })
    const base = { fieldErrors: errors, incomplete, warnings: [] as string[], error: null }
    if (!values) return { ...base, result: null }

    // 2) Regra que depende dos dois campos: x não pode passar de n.
    if (values.successes > values.n)
      return { ...base, result: null, fieldErrors: { successes: "Não pode ser maior que o tamanho da amostra (n)." } }

    // 3) Conta + alertas.
    const res = proportionConfidenceInterval({ ...values, level })
    if (!res.ok) return { ...base, result: null, error: res.error }
    return { ...base, result: res.data, warnings: proportionWarnings(res.data) }
  }, [successes, n, level])
}
