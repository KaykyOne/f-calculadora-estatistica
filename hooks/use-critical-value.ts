/**
 * useCriticalValue — devolve α, α/2 e Zα/2 para o grau de confiança escolhido.
 * A tabela de valores fica em lib/statistics/critical-values.ts.
 */

import { useMemo } from "react"
import { getCriticalValue } from "@/lib/statistics/critical-values"
import type { ConfidenceLevel, CriticalValue } from "@/lib/statistics/types"

export function useCriticalValue(level: ConfidenceLevel): CriticalValue {
  return useMemo(() => getCriticalValue(level), [level])
}
