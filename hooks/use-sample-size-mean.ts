import { useMemo } from "react"
import { sampleSizeMean } from "@/lib/statistics/sample-size"
import { validateFields } from "@/lib/statistics/validation"
import type { CalcState, ConfidenceLevel, SampleSizeMeanResult } from "@/lib/statistics/types"

export type SampleSizeMeanField = "sd" | "margin"

export interface SampleSizeMeanForm {
  sd: string
  margin: string
  level: ConfidenceLevel
}

export function useSampleSizeMean(form: SampleSizeMeanForm): CalcState<SampleSizeMeanResult, SampleSizeMeanField> {
  const { sd, margin, level } = form
  return useMemo(() => {
    const positive = { min: 0, minExclusive: true }
    const { values, errors, incomplete } = validateFields<SampleSizeMeanField>({
      sd: { raw: sd, rule: positive },
      margin: { raw: margin, rule: positive },
    })
    const base = { fieldErrors: errors, incomplete, warnings: [] as string[], error: null }
    if (!values) return { ...base, result: null }
    const res = sampleSizeMean({ ...values, level })
    return res.ok ? { ...base, result: res.data } : { ...base, result: null, error: res.error }
  }, [sd, margin, level])
}
