/**
 * usePearsonCorrelation — correlação de Pearson a partir das linhas da tabela X/Y.
 */

import { useMemo } from "react"
import { pearsonCorrelation } from "@/lib/statistics/correlation"
import type { PairRow } from "@/lib/statistics/validation"
import type { CorrelationResult } from "@/lib/statistics/types"
import { usePairs, type PairsState } from "./use-pairs"

export function usePearsonCorrelation(rows: PairRow[]): PairsState<CorrelationResult> {
  // 1) Texto da tabela → pares.
  const { pairs, rowErrors, ready, incomplete } = usePairs(rows)

  return useMemo(() => {
    const base = { pairs, rowErrors, fieldErrors: {}, warnings: [], incomplete, error: null }
    if (!ready) return { ...base, result: null }

    // 2) Conta.
    const res = pearsonCorrelation(pairs)
    return res.ok ? { ...base, result: res.data } : { ...base, result: null, error: res.error }
  }, [pairs, rowErrors, ready, incomplete])
}
