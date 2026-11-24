/**
 * usePairs — converte as linhas da tabela X/Y (texto) em pares numéricos.
 * Compartilhado por usePearsonCorrelation e useLinearRegression.
 */

import { useMemo } from "react"
import { parsePairRows, type PairRow } from "@/lib/statistics/validation"
import type { CalcState, DataPair } from "@/lib/statistics/types"

/** Estado dos cálculos que usam pares: o CalcState de sempre + os pares lidos e os erros por linha. */
export interface PairsState<T> extends CalcState<T> {
  pairs: DataPair[]
  /** Índice da linha → mensagem de erro. */
  rowErrors: Record<number, string>
}

export function usePairs(rows: PairRow[]) {
  return useMemo(() => {
    const { pairs, rowErrors } = parsePairRows(rows)
    const hasRowErrors = Object.keys(rowErrors).length > 0
    return {
      pairs,
      rowErrors,
      /** Pronto para calcular: sem erros e com pelo menos 2 pares. */
      ready: !hasRowErrors && pairs.length >= 2,
      /** Ainda faltam pares (mas o que foi digitado está certo). */
      incomplete: !hasRowErrors && pairs.length < 2,
    }
  }, [rows])
}
