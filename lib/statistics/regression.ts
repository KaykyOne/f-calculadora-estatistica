/**
 * REGRESSÃO LINEAR SIMPLES (mínimos quadrados)
 *
 * Reta: ŷ = a·x + b
 *       a = Σ(xi − x̄)(yi − ȳ) / Σ(xi − x̄)²   (coeficiente angular)
 *       b = ȳ − a·x̄                          (intercepto)
 *       R² = r²                              (quanto da variação de Y a reta explica)
 *
 * Reaproveita os somatórios de correlation.ts, sem repetir as contas.
 */

import { hasVariability, pairSums, pearsonCorrelation } from "./correlation"
import type { DataPair, Prediction, RegressionResult, StatResult } from "./types"

/** Ajusta a reta de regressão aos pares (X, Y). */
export function linearRegression(pairs: DataPair[]): StatResult<RegressionResult> {
  const sums = pairSums(pairs)
  if (!sums.ok) return sums

  // Sem variação em X, Σ(xi − x̄)² = 0 e "a" seria divisão por zero.
  if (!hasVariability(pairs.map((p) => p.x)))
    return { ok: false, error: "Todos os valores de X são iguais: sem variabilidade em X não é possível ajustar a reta." }

  const { sumXY, sumXX, meanX, meanY } = sums.data
  const a = sumXY / sumXX
  const b = meanY - a * meanX

  // r só existe se Y também varia; quando Y é constante, a reta é horizontal e r/R² ficam null.
  const pearson = pearsonCorrelation(pairs)
  const r = pearson.ok ? pearson.data.r : null
  return { ok: true, data: { ...sums.data, a, b, r, rSquared: r === null ? null : r * r } }
}

/** Previsão ŷ = a·x + b, avisando se x está fora do intervalo de X observado (extrapolação). */
export function predict(model: RegressionResult, x: number): Prediction {
  return { x, y: model.a * x + model.b, extrapolation: x < model.minX || x > model.maxX }
}
