import { hasVariability, pairSums, pearsonCorrelation } from "./correlation"
import type { DataPair, Prediction, RegressionResult, StatResult } from "./types"

/** Mínimos quadrados: a = Σ(xi − x̄)(yi − ȳ) / Σ(xi − x̄)² ; b = ȳ − a·x̄. */
export function linearRegression(pairs: DataPair[]): StatResult<RegressionResult> {
  const sums = pairSums(pairs)
  if (!sums.ok) return sums
  if (!hasVariability(pairs.map((p) => p.x)))
    return { ok: false, error: "Todos os valores de X são iguais: sem variabilidade em X não é possível ajustar a reta." }

  const { sumXY, sumXX, meanX, meanY } = sums.data
  const a = sumXY / sumXX
  const b = meanY - a * meanX
  const pearson = pearsonCorrelation(pairs)
  const r = pearson.ok ? pearson.data.r : null
  return { ok: true, data: { ...sums.data, a, b, r, rSquared: r === null ? null : r * r } }
}

/** ŷ = a·x + b, indicando se x está fora do intervalo observado. */
export function predict(model: RegressionResult, x: number): Prediction {
  return { x, y: model.a * x + model.b, extrapolation: x < model.minX || x > model.maxX }
}
