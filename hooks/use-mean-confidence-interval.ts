/**
 * useMeanConfidenceInterval — IC para a média.
 * Lê os campos (texto), valida, chama a fórmula e gera os alertas.
 */

import { useMemo } from "react"
import { meanConfidenceInterval } from "@/lib/statistics/confidence-intervals"
import { validateFields } from "@/lib/statistics/validation"
import type { CalcState, ConfidenceLevel, DeviationType, MeanCIResult } from "@/lib/statistics/types"

/** Nomes dos campos numéricos (usados nos erros por campo). */
export type MeanCIField = "mean" | "sd" | "n"

/** O formulário como está na tela: números ainda são texto. */
export interface MeanCIForm {
  mean: string
  sd: string
  n: string
  sdType: DeviationType
  level: ConfidenceLevel
}

export function useMeanConfidenceInterval(form: MeanCIForm): CalcState<MeanCIResult, MeanCIField> {
  const { mean, sd, n, sdType, level } = form
  return useMemo(() => {
    // 1) Valida: média livre, desvio ≥ 0, n inteiro > 0.
    const { values, errors, incomplete } = validateFields<MeanCIField>({
      mean: { raw: mean },
      sd: { raw: sd, rule: { min: 0 } },
      n: { raw: n, rule: { integer: true, min: 0, minExclusive: true } },
    })
    const base = { fieldErrors: errors, incomplete, warnings: [] as string[], error: null }
    if (!values) return { ...base, result: null }

    // 2) Conta.
    const res = meanConfidenceInterval({ ...values, level })
    if (!res.ok) return { ...base, result: null, error: res.error }

    // 3) Alertas. Com s e n ≤ 30 o material indicaria t de Student; aqui só avisamos (não trocamos a fórmula).
    const warnings: string[] = []
    if (sdType === "sample" && values.n <= 30)
      warnings.push(
        "Com desvio amostral (s) e n ≤ 30, a abordagem pela distribuição normal (Z) do material não é adequada. Avalie o uso da distribuição t de Student. O resultado abaixo usa Z apenas como referência.",
      )
    if (values.sd === 0) warnings.push("Com desvio padrão igual a zero, a margem de erro é nula.")
    return { ...base, result: res.data, warnings }
  }, [mean, sd, n, sdType, level])
}
