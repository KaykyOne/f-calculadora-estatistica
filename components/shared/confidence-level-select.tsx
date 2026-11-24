"use client"

/**
 * ConfidenceLevelSelect — escolha do grau de confiança (90%, 95% ou 99%).
 * As opções vêm de CONFIDENCE_LEVELS, em lib/statistics/critical-values.ts.
 */

import { CONFIDENCE_LEVELS } from "@/lib/statistics/critical-values"
import type { ConfidenceLevel } from "@/lib/statistics/types"
import { SegmentedControl } from "./segmented-control"

interface ConfidenceLevelSelectProps {
  value: ConfidenceLevel
  onChange: (level: ConfidenceLevel) => void
}

const OPTIONS = CONFIDENCE_LEVELS.map((level) => ({ value: level, label: `${level}%` }))

export function ConfidenceLevelSelect({ value, onChange }: ConfidenceLevelSelectProps) {
  return <SegmentedControl label="Grau de confiança" value={value} options={OPTIONS} onChange={onChange} />
}
