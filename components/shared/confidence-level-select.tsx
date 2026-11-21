"use client"

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
