import { useMemo } from "react"
import { linearRegression, predict } from "@/lib/statistics/regression"
import { validateField, type PairRow } from "@/lib/statistics/validation"
import type { Prediction, RegressionResult } from "@/lib/statistics/types"
import { usePairs, type PairsState } from "./use-pearson-correlation"

export interface RegressionState extends PairsState<RegressionResult> {
  prediction: Prediction | null
  predictionError: string | null
}

export function useLinearRegression(rows: PairRow[], predictX: string): RegressionState {
  const { pairs, rowErrors, ready, incomplete } = usePairs(rows)

  const model = useMemo(() => (ready ? linearRegression(pairs) : null), [pairs, ready])

  return useMemo(() => {
    const base = { pairs, rowErrors, fieldErrors: {}, incomplete, prediction: null, predictionError: null }
    if (!model) return { ...base, result: null, error: null, warnings: [] }
    if (!model.ok) return { ...base, result: null, error: model.error, warnings: [] }

    const warnings: string[] = []
    if (model.data.r === null)
      warnings.push("Y não varia: a reta é horizontal e os coeficientes r e R² não estão definidos.")

    const x = validateField(predictX)
    const prediction = x.value !== undefined ? predict(model.data, x.value) : null
    if (prediction?.extrapolation)
      warnings.push(
        "O valor de X informado está fora do intervalo observado: a previsão é uma extrapolação e pode não ser confiável.",
      )
    return { ...base, result: model.data, error: null, warnings, prediction, predictionError: x.error ?? null }
  }, [pairs, rowErrors, incomplete, model, predictX])
}
