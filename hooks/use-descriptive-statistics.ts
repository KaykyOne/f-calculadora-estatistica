/**
 * useDescriptiveStatistics — aba Base.
 * Recebe o texto da caixa de valores, lê a lista e calcula média, σ e s.
 */

import { useMemo } from "react"
import { describe } from "@/lib/statistics/descriptive"
import { parseValueList } from "@/lib/statistics/validation"
import type { CalcState, DescriptiveResult } from "@/lib/statistics/types"

export interface DescriptiveState extends CalcState<DescriptiveResult> {
  /** Valores lidos (a tela mostra "✓ Lidos N valores: ..."). */
  values: number[]
}

export function useDescriptiveStatistics(text: string): DescriptiveState {
  return useMemo(() => {
    // 1) Texto → lista de números.
    const { values, error } = parseValueList(text)
    const base = { values, fieldErrors: {}, warnings: [] as string[], incomplete: false, error: null }
    if (error) return { ...base, result: null, error }
    if (values.length === 0) return { ...base, result: null, incomplete: true }

    // 2) Conta.
    const res = describe(values)
    if (!res.ok) return { ...base, result: null, error: res.error }

    // 3) Alerta: com um valor só, s não existe (divisão por n − 1 = 0).
    const warnings =
      values.length === 1 ? ["Com apenas um valor, o desvio padrão amostral (s) não está definido (n − 1 = 0)."] : []
    return { ...base, result: res.data, warnings }
  }, [text])
}
