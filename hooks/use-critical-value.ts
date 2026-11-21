import { useMemo } from "react"
import { getCriticalValue } from "@/lib/statistics/critical-values"
import type { ConfidenceLevel, CriticalValue } from "@/lib/statistics/types"

export function useCriticalValue(level: ConfidenceLevel): CriticalValue {
  return useMemo(() => getCriticalValue(level), [level])
}
