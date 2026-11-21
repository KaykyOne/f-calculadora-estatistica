import type { DescriptiveResult, StatResult } from "./types"

/**
 * Média, variância e desvio padrão.
 * Populacional (σ): divide por n. Amostral (s): divide por n − 1.
 */
export function describe(values: number[]): StatResult<DescriptiveResult> {
  const n = values.length
  if (n === 0) return { ok: false, error: "Informe pelo menos um valor." }
  if (!values.every(Number.isFinite)) return { ok: false, error: "Há valores inválidos na lista." }

  const sum = values.reduce((s, x) => s + x, 0)
  const mean = sum / n
  const rows = values.map((x) => {
    const deviation = x - mean
    return { x, deviation, squared: deviation * deviation }
  })
  const sumSquares = rows.reduce((s, r) => s + r.squared, 0)
  const populationVariance = sumSquares / n
  const sampleVariance = n > 1 ? sumSquares / (n - 1) : null
  return {
    ok: true,
    data: {
      n,
      sum,
      mean,
      rows,
      sumSquares,
      populationVariance,
      populationSd: Math.sqrt(populationVariance),
      sampleVariance,
      sampleSd: sampleVariance === null ? null : Math.sqrt(sampleVariance),
    },
  }
}
