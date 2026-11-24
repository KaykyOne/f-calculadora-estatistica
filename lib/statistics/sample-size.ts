/**
 * TAMANHO DA AMOSTRA
 *
 * Média:     n = ( Zα/2 · σ / Em )²
 * Proporção: n = Zα/2² · p · (1 − p) / Ep²
 *
 * O resultado final é SEMPRE arredondado para cima (ceilSampleSize),
 * porque arredondar para baixo daria uma margem de erro maior que a pedida.
 * Os valores intermediários não são arredondados.
 */

import { getCriticalValue } from "./critical-values"
import type {
  SampleSizeMeanInput,
  SampleSizeMeanResult,
  SampleSizeProportionInput,
  SampleSizeProportionResult,
  StatResult,
} from "./types"

/**
 * Arredonda o tamanho da amostra para cima.
 * O "− 1e-9" é uma tolerância minúscula: o computador às vezes calcula 600 como
 * 600,0000000000001, e sem ela o Math.ceil daria 601 por engano.
 */
export function ceilSampleSize(raw: number): number {
  return Math.ceil(raw - 1e-9)
}

/** Tamanho mínimo da amostra para estimar uma MÉDIA. */
export function sampleSizeMean(input: SampleSizeMeanInput): StatResult<SampleSizeMeanResult> {
  const { sd, margin, level } = input

  // Validações: σ e Em precisam ser positivos (Em = 0 seria divisão por zero).
  if (!Number.isFinite(sd) || sd <= 0) return { ok: false, error: "O desvio padrão deve ser maior que zero." }
  if (!Number.isFinite(margin) || margin <= 0) return { ok: false, error: "A margem de erro deve ser maior que zero." }

  const { z } = getCriticalValue(level)
  const ratio = (z * sd) / margin //  Z · σ / Em
  const raw = ratio ** 2 //           ( ... )²
  return { ok: true, data: { z, sd, margin, ratio, raw, n: ceilSampleSize(raw) } }
}

/** Tamanho mínimo da amostra para estimar uma PROPORÇÃO. p e Ep chegam em decimal (0,30 e 0,02). */
export function sampleSizeProportion(
  input: SampleSizeProportionInput,
): StatResult<SampleSizeProportionResult> {
  const { p, margin, level } = input

  // Validações: 0 < p < 1 e 0 < Ep < 1.
  if (!Number.isFinite(p) || p <= 0 || p >= 1)
    return { ok: false, error: "A proporção esperada deve estar entre 0 e 1 (exclusive)." }
  if (!Number.isFinite(margin) || margin <= 0 || margin >= 1)
    return { ok: false, error: "A margem de erro deve estar entre 0 e 1 (exclusive)." }

  const { z } = getCriticalValue(level)
  const zSquared = z ** 2 //                         Z²
  const q = 1 - p //                                 1 − p
  const marginSquared = margin ** 2 //               Ep²
  const raw = (zSquared * p * q) / marginSquared //  Z² · p · (1 − p) / Ep²
  return { ok: true, data: { z, zSquared, p, q, margin, marginSquared, raw, n: ceilSampleSize(raw) } }
}
