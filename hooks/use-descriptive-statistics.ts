import { useMemo } from "react"
import { describe } from "@/lib/statistics/descriptive"
import { parseValueList } from "@/lib/statistics/validation"
import type { CalcState, DescriptiveResult } from "@/lib/statistics/types"

export interface DescriptiveState extends CalcState<DescriptiveResult> {
  values: number[]
}

export function useDescriptiveStatistics(text: string): DescriptiveState {
  return useMemo(() => {
    const { values, error } = parseValueList(text)
    const base = { values, fieldErrors: {}, warnings: [] as string[], incomplete: false, error: null }
    if (error) return { ...base, result: null, error }
    if (values.length === 0) return { ...base, result: null, incomplete: true }

    const res = describe(values)
    if (!res.ok) return { ...base, result: null, error: res.error }
    const warnings =
      values.length === 1 ? ["Com apenas um valor, o desvio padrão amostral (s) não está definido (n − 1 = 0)."] : []
    return { ...base, result: res.data, warnings }
  }, [text])
}
