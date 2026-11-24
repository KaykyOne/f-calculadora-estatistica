/**
 * INTERVALOS DE CONFIANÇA
 *
 * Média:     Em = Zα/2 · σ / √n             IC = (x̄ − Em ; x̄ + Em)
 * Proporção: p = x / n
 *            Ep = Zα/2 · √( p(1 − p) / n )  IC = (p − Ep ; p + Ep)
 *
 * As funções recebem números já convertidos (a leitura do texto fica em validation.ts)
 * e conferem de novo as regras, para nunca devolver NaN ou Infinity.
 */

import { getCriticalValue } from "./critical-values"
import type {
  MeanCIInput,
  MeanCIResult,
  ProportionCIInput,
  ProportionCIResult,
  StatResult,
} from "./types"

/** n precisa ser inteiro e maior que zero. */
const isPositiveInt = (v: number) => Number.isInteger(v) && v > 0

/** Intervalo de confiança para a média populacional μ. */
export function meanConfidenceInterval(input: MeanCIInput): StatResult<MeanCIResult> {
  const { mean, sd, n, level } = input

  // Validações.
  if (![mean, sd, n].every(Number.isFinite)) return { ok: false, error: "Valores inválidos." }
  if (sd < 0) return { ok: false, error: "O desvio padrão não pode ser negativo." }
  if (!isPositiveInt(n)) return { ok: false, error: "O tamanho da amostra deve ser um inteiro positivo." }

  // Conta, na mesma ordem do passo a passo da tela.
  const { z } = getCriticalValue(level)
  const sqrtN = Math.sqrt(n) //               √n
  const standardError = sd / sqrtN //         σ / √n
  const margin = z * standardError //         Em = Z · σ/√n
  return {
    ok: true,
    data: { z, mean, sd, n, sqrtN, standardError, margin, lower: mean - margin, upper: mean + margin },
  }
}

/** Intervalo de confiança para a proporção populacional π. */
export function proportionConfidenceInterval(
  input: ProportionCIInput,
): StatResult<ProportionCIResult> {
  const { successes, n, level } = input

  // Validações: n inteiro positivo e 0 ≤ x ≤ n.
  if (!isPositiveInt(n)) return { ok: false, error: "O tamanho da amostra deve ser um inteiro positivo." }
  if (!Number.isInteger(successes) || successes < 0 || successes > n)
    return { ok: false, error: "O número de sucessos deve ser um inteiro entre 0 e n." }

  // Conta. p NÃO é arredondado: usa a precisão completa (ex.: 860/2200).
  const { z } = getCriticalValue(level)
  const p = successes / n //                  p = x / n
  const q = 1 - p //                          1 − p
  const variance = (p * q) / n //             p(1 − p) / n
  const standardError = Math.sqrt(variance) //√( p(1 − p) / n )
  const margin = z * standardError //         Ep
  return {
    ok: true,
    data: { z, successes, n, p, q, variance, standardError, margin, lower: p - margin, upper: p + margin },
  }
}

/**
 * Alertas de quando a aproximação pela curva normal não é confiável para proporções.
 * Regra usual: pelo menos 5 sucessos e 5 fracassos.
 */
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
