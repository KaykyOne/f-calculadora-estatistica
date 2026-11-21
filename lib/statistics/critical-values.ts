import type { ConfidenceLevel, CriticalValue } from "./types"

export const CONFIDENCE_LEVELS: readonly ConfidenceLevel[] = [90, 95, 99]

/** Valores críticos adotados no material didático. */
const TABLE: Record<ConfidenceLevel, { alpha: number; z: number }> = {
  90: { alpha: 0.1, z: 1.645 },
  95: { alpha: 0.05, z: 1.96 },
  99: { alpha: 0.01, z: 2.575 },
}

export function getCriticalValue(level: ConfidenceLevel): CriticalValue {
  const { alpha, z } = TABLE[level]
  return { level, confidence: level / 100, alpha, halfAlpha: alpha / 2, z }
}
