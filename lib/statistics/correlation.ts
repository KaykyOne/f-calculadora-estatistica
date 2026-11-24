/**
 * CORRELAÇÃO DE PEARSON
 *
 *        Σ(xi − x̄)(yi − ȳ)
 * r = ───────────────────────────
 *     √( Σ(xi − x̄)² · Σ(yi − ȳ)² )
 *
 * r vai de −1 a 1: o sinal dá o sentido (positiva/negativa) e |r| dá a força.
 * As médias e somatórios (pairSums) também são usados pela regressão (regression.ts).
 */

import type {
  CorrelationResult,
  CorrelationStrength,
  DataPair,
  PairSums,
  StatResult,
} from "./types"

/**
 * Tolerância numérica. Usada só para decidir se |r| é "exatamente" 1 ou 0,
 * já que o computador pode devolver 0,9999999999999998 em vez de 1.
 */
const EPS = 1e-12

/** Calcula as médias de X e Y e os três somatórios de desvios. */
export function pairSums(pairs: DataPair[]): StatResult<PairSums> {
  const n = pairs.length
  if (n < 2) return { ok: false, error: "São necessários pelo menos dois pares de valores." }
  if (!pairs.every((p) => Number.isFinite(p.x) && Number.isFinite(p.y)))
    return { ok: false, error: "Há valores inválidos nos pares." }

  // Médias x̄ e ȳ.
  const meanX = pairs.reduce((acc, p) => acc + p.x, 0) / n
  const meanY = pairs.reduce((acc, p) => acc + p.y, 0) / n

  // Somatórios dos desvios, percorrendo os pares uma única vez.
  let sumXY = 0 // Σ(xi − x̄)(yi − ȳ)
  let sumXX = 0 // Σ(xi − x̄)²
  let sumYY = 0 // Σ(yi − ȳ)²
  for (const { x, y } of pairs) {
    const dx = x - meanX
    const dy = y - meanY
    sumXY += dx * dy
    sumXX += dx * dx
    sumYY += dy * dy
  }

  const xs = pairs.map((p) => p.x)
  return {
    ok: true,
    data: { n, meanX, meanY, sumXY, sumXX, sumYY, minX: Math.min(...xs), maxX: Math.max(...xs) },
  }
}

/**
 * true se os valores não são todos iguais.
 * Compara máximo e mínimo (exato), em vez de testar Σ(xi − x̄)² = 0,
 * que pode dar 1e-33 em vez de 0 por arredondamento do computador.
 */
export const hasVariability = (values: number[]) => Math.max(...values) !== Math.min(...values)

/** Classificação didática do material, pelo valor absoluto de r. */
export function classifyCorrelation(r: number): CorrelationStrength {
  const abs = Math.abs(r)
  if (abs >= 1 - EPS) return "perfeita" // |r| = 1
  if (abs < EPS) return "nula" //          r = 0
  if (abs >= 0.7) return "forte" //        0,7 ≤ |r| < 1
  if (abs >= 0.3) return "moderada" //     0,3 ≤ |r| < 0,7
  return "fraca" //                        0 < |r| < 0,3
}

/** Monta a frase de interpretação mostrada no card de resultado. */
function interpret(strength: CorrelationStrength, direction: CorrelationResult["direction"]): string {
  if (strength === "nula") return "Não há correlação linear entre X e Y."
  const sentido =
    direction === "positiva"
      ? "quando X aumenta, Y tende a aumentar"
      : "quando X aumenta, Y tende a diminuir"
  if (strength === "perfeita")
    return `Correlação linear perfeita ${direction}: os pontos estão exatamente sobre uma reta (${sentido}).`
  return `Correlação linear ${direction} ${strength}: ${sentido}.`
}

/** Coeficiente de correlação de Pearson. */
export function pearsonCorrelation(pairs: DataPair[]): StatResult<CorrelationResult> {
  const sums = pairSums(pairs)
  if (!sums.ok) return sums

  // Se X ou Y não variam, o denominador é zero e r não existe.
  if (!hasVariability(pairs.map((p) => p.x)))
    return { ok: false, error: "Todos os valores de X são iguais: sem variabilidade, o coeficiente r não está definido." }
  if (!hasVariability(pairs.map((p) => p.y)))
    return { ok: false, error: "Todos os valores de Y são iguais: sem variabilidade, o coeficiente r não está definido." }

  const { sumXY, sumXX, sumYY } = sums.data
  // Math.max/min garantem −1 ≤ r ≤ 1 mesmo com erros mínimos de arredondamento.
  const r = Math.max(-1, Math.min(1, sumXY / Math.sqrt(sumXX * sumYY)))
  const strength = classifyCorrelation(r)
  const direction = strength === "nula" ? "nenhuma" : r > 0 ? "positiva" : "negativa"
  return { ok: true, data: { ...sums.data, r, strength, direction, interpretation: interpret(strength, direction) } }
}
