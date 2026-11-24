/**
 * useSampleSizeMean — tamanho da amostra para média.
 * Lê σ e Em, valida e chama a fórmula n = (Z·σ/Em)², arredondada para cima.
 */

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
    // 1) Valida: σ > 0 e Em > 0.
    const positive = { min: 0, minExclusive: true }
    const { values, errors, incomplete } = validateFields<SampleSizeMeanField>({
      sd: { raw: sd, rule: positive },
      margin: { raw: margin, rule: positive },
    })
    const base = { fieldErrors: errors, incomplete, warnings: [] as string[], error: null }
    if (!values) return { ...base, result: null }

    // 2) Conta.
    const res = sampleSizeMean({ ...values, level })
    return res.ok ? { ...base, result: res.data } : { ...base, result: null, error: res.error }
  }, [sd, margin, level])
}
