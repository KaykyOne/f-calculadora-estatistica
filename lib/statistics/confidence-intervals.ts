import { getCriticalValue } from "./critical-values"
import type {
  MeanCIInput,
  MeanCIResult,
  ProportionCIInput,
  ProportionCIResult,
  StatResult,
} from "./types"

const isPositiveInt = (v: number) => Number.isInteger(v) && v > 0

/** IC para a média: Em = Z · σ/√n ; IC = (x̄ − Em ; x̄ + Em). */
export function meanConfidenceInterval(input: MeanCIInput): StatResult<MeanCIResult> {
  const { mean, sd, n, level } = input
  if (![mean, sd, n].every(Number.isFinite)) return { ok: false, error: "Valores inválidos." }
  if (sd < 0) return { ok: false, error: "O desvio padrão não pode ser negativo." }
  if (!isPositiveInt(n)) return { ok: false, error: "O tamanho da amostra deve ser um inteiro positivo." }

  const { z } = getCriticalValue(level)
  const sqrtN = Math.sqrt(n)
  const standardError = sd / sqrtN
  const margin = z * standardError
  return {
    ok: true,
    data: { z, mean, sd, n, sqrtN, standardError, margin, lower: mean - margin, upper: mean + margin },
  }
}

/** IC para proporção: p = x/n ; Ep = Z · √(p(1−p)/n). */
export function proportionConfidenceInterval(
  input: ProportionCIInput,
): StatResult<ProportionCIResult> {
  const { successes, n, level } = input
  if (!isPositiveInt(n)) return { ok: false, error: "O tamanho da amostra deve ser um inteiro positivo." }
  if (!Number.isInteger(successes) || successes < 0 || successes > n)
    return { ok: false, error: "O número de sucessos deve ser um inteiro entre 0 e n." }

  const { z } = getCriticalValue(level)
  const p = successes / n
  const q = 1 - p
  const variance = (p * q) / n
  const standardError = Math.sqrt(variance)
  const margin = z * standardError
  return {
    ok: true,
    data: { z, successes, n, p, q, variance, standardError, margin, lower: p - margin, upper: p + margin },
  }
}

/** Avisos sobre a validade da aproximação normal para proporções. */
export function proportionWarnings(r: ProportionCIResult): string[] {
  const warnings: string[] = []
  const failures = r.n - r.successes
  if (r.successes < 5 || failures < 5)
    warnings.push(
      `A aproximação normal é inadequada: são necessários pelo menos 5 sucessos e 5 fracassos (há ${r.successes} e ${failures}).`,
    )
  if (r.lower < 0 || r.upper > 1)
    warnings.push("O intervalo ultrapassa os limites de 0 a 1, outro sinal de que a aproximação normal não é adequada.")
  return warnings
}
