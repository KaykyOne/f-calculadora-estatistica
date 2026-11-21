import type {
  CorrelationResult,
  CorrelationStrength,
  DataPair,
  PairSums,
  StatResult,
} from "./types"

const EPS = 1e-12

/** Médias e somatórios dos desvios — base de Pearson e da regressão. */
export function pairSums(pairs: DataPair[]): StatResult<PairSums> {
  const n = pairs.length
  if (n < 2) return { ok: false, error: "São necessários pelo menos dois pares de valores." }
  if (!pairs.every((p) => Number.isFinite(p.x) && Number.isFinite(p.y)))
    return { ok: false, error: "Há valores inválidos nos pares." }

  const meanX = pairs.reduce((s, p) => s + p.x, 0) / n
  const meanY = pairs.reduce((s, p) => s + p.y, 0) / n
  let sumXY = 0
  let sumXX = 0
  let sumYY = 0
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

export const hasVariability = (values: number[]) => Math.max(...values) !== Math.min(...values)

export function classifyCorrelation(r: number): CorrelationStrength {
  const abs = Math.abs(r)
  if (abs >= 1 - EPS) return "perfeita"
  if (abs < EPS) return "nula"
  if (abs >= 0.7) return "forte"
  if (abs >= 0.3) return "moderada"
  return "fraca"
}

function interpret(strength: CorrelationStrength, direction: CorrelationResult["direction"]): string {
  if (strength === "nula") return "Não há correlação linear entre X e Y."
  const sentido =
    direction === "positiva"
      ? "quando X aumenta, Y tende a aumentar"
      : "quando X aumenta, Y tende a diminuir"
  if (strength === "perfeita") return `Correlação linear perfeita ${direction}: os pontos estão exatamente sobre uma reta (${sentido}).`
  return `Correlação linear ${direction} ${strength}: ${sentido}.`
}

/** r = Σ(xi − x̄)(yi − ȳ) / √(Σ(xi − x̄)² · Σ(yi − ȳ)²) */
export function pearsonCorrelation(pairs: DataPair[]): StatResult<CorrelationResult> {
  const sums = pairSums(pairs)
  if (!sums.ok) return sums
  if (!hasVariability(pairs.map((p) => p.x)))
    return { ok: false, error: "Todos os valores de X são iguais: sem variabilidade, o coeficiente r não está definido." }
  if (!hasVariability(pairs.map((p) => p.y)))
    return { ok: false, error: "Todos os valores de Y são iguais: sem variabilidade, o coeficiente r não está definido." }

  const { sumXY, sumXX, sumYY } = sums.data
  const r = Math.max(-1, Math.min(1, sumXY / Math.sqrt(sumXX * sumYY)))
  const strength = classifyCorrelation(r)
  const direction = strength === "nula" ? "nenhuma" : r > 0 ? "positiva" : "negativa"
  return { ok: true, data: { ...sums.data, r, strength, direction, interpretation: interpret(strength, direction) } }
}
