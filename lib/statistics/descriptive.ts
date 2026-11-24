/**
 * ESTATÍSTICA DESCRITIVA (aba "Base")
 *
 * Calcula média, variância e desvio padrão de uma lista de valores.
 *
 *   x̄  = Σx / n
 *   σ  = √( Σ(xi − x̄)² / n )        → populacional: os dados são a população inteira
 *   s  = √( Σ(xi − x̄)² / (n − 1) )  → amostral: os dados são uma amostra
 */

import type { DescriptiveResult, StatResult } from "./types"

export function describe(values: number[]): StatResult<DescriptiveResult> {
  const n = values.length

  // Validações: lista vazia ou com valores não numéricos.
  if (n === 0) return { ok: false, error: "Informe pelo menos um valor." }
  if (!values.every(Number.isFinite)) return { ok: false, error: "Há valores inválidos na lista." }

  // 1) Soma e média.
  const sum = values.reduce((acc, x) => acc + x, 0)
  const mean = sum / n

  // 2) Tabela de desvios: para cada valor, quanto ele se afasta da média e esse afastamento ao quadrado.
  const rows = values.map((x) => {
    const deviation = x - mean
    return { x, deviation, squared: deviation * deviation }
  })

  // 3) Soma dos quadrados dos desvios: Σ(xi − x̄)².
  const sumSquares = rows.reduce((acc, row) => acc + row.squared, 0)

  // 4) Variâncias. A amostral divide por (n − 1), então não existe com um único valor.
  const populationVariance = sumSquares / n
  const sampleVariance = n > 1 ? sumSquares / (n - 1) : null

  // 5) Desvio padrão = raiz da variância.
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
