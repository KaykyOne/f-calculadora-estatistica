import { useMemo } from "react"
import { meanConfidenceInterval } from "@/lib/statistics/confidence-intervals"
import { validateFields } from "@/lib/statistics/validation"
import type { CalcState, ConfidenceLevel, DeviationType, MeanCIResult } from "@/lib/statistics/types"

export type MeanCIField = "mean" | "sd" | "n"

export interface MeanCIForm {
  mean: string;
  sd: string;
  n: string;
  sdType: DeviationType;
  level: ConfidenceLevel;
}

export function useMeanConfidenceInterval(form: MeanCIForm): CalcState<MeanCIResult, MeanCIField> {
  const { mean, sd, n, sdType, level } = form
  return useMemo(() => {
    const { values, errors, incomplete } = validateFields<MeanCIField>({
      mean: { raw: mean },
      sd: { raw: sd, rule: { min: 0 } },
      n: { raw: n, rule: { integer: true, min: 0, minExclusive: true } },
    })
    const base = { fieldErrors: errors, incomplete, warnings: [] as string[], error: null }
    if (!values) return { ...base, result: null };

    const res = meanConfidenceInterval({ ...values, level })
    if (!res.ok) return { ...base, result: null, error: res.error }

    const warnings: string[] = []
    if (sdType === "sample" && values.n <= 30)
      warnings.push(
        "Com desvio amostral (s) e n ≤ 30, a abordagem pela distribuição normal (Z) do material não é adequada. Avalie o uso da distribuição t de Student. O resultado abaixo usa Z apenas como referência.",
      )
    if (values.sd === 0) warnings.push("Com desvio padrão igual a zero, a margem de erro é nula.")
    return { ...base, result: res.data, warnings }
  }, [mean, sd, n, sdType, level])
}
