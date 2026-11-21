import { useMemo } from "react"
import { pearsonCorrelation } from "@/lib/statistics/correlation"
import { parsePairRows, type PairRow } from "@/lib/statistics/validation"
import type { CalcState, CorrelationResult, DataPair } from "@/lib/statistics/types"

export interface PairsState<T> extends CalcState<T> {
  pairs: DataPair[]
  /** Erros por índice de linha da tabela. */
  rowErrors: Record<number, string>
}

/** Converte as linhas da tabela e indica se já há dados suficientes para calcular. */
export function usePairs(rows: PairRow[]) {
  return useMemo(() => {
    const { pairs, rowErrors } = parsePairRows(rows)
    const hasRowErrors = Object.keys(rowErrors).length > 0
    return { pairs, rowErrors, ready: !hasRowErrors && pairs.length >= 2, incomplete: !hasRowErrors && pairs.length < 2 }
  }, [rows])
}

export function usePearsonCorrelation(rows: PairRow[]): PairsState<CorrelationResult> {
  const { pairs, rowErrors, ready, incomplete } = usePairs(rows)
  return useMemo(() => {
    const base = { pairs, rowErrors, fieldErrors: {}, warnings: [], incomplete, error: null }
    if (!ready) return { ...base, result: null }
    const res = pearsonCorrelation(pairs)
    return res.ok ? { ...base, result: res.data } : { ...base, result: null, error: res.error }
  }, [pairs, rowErrors, ready, incomplete])
}
