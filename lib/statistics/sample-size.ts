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
 * Uma tolerância mínima evita que um erro de ponto flutuante
 * (ex.: 600,0000000000001) gere uma unidade a mais.
 */
export function ceilSampleSize(raw: number): number {
  return Math.ceil(raw - 1e-9)
}

/** n = (Z · σ / Em)² */
export function sampleSizeMean(input: SampleSizeMeanInput): StatResult<SampleSizeMeanResult> {
  const { sd, margin, level } = input
  if (!Number.isFinite(sd) || sd <= 0) return { ok: false, error: "O desvio padrão deve ser maior que zero." }
  if (!Number.isFinite(margin) || margin <= 0) return { ok: false, error: "A margem de erro deve ser maior que zero." }

  const { z } = getCriticalValue(level)
  const ratio = (z * sd) / margin
  const raw = ratio ** 2
  return { ok: true, data: { z, sd, margin, ratio, raw, n: ceilSampleSize(raw) } }
}

/** n = Z² · p · (1 − p) / Ep² */
export function sampleSizeProportion(
  input: SampleSizeProportionInput,
): StatResult<SampleSizeProportionResult> {
  const { p, margin, level } = input
  if (!Number.isFinite(p) || p <= 0 || p >= 1)
    return { ok: false, error: "A proporção esperada deve estar entre 0 e 1 (exclusive)." }
  if (!Number.isFinite(margin) || margin <= 0 || margin >= 1)
    return { ok: false, error: "A margem de erro deve estar entre 0 e 1 (exclusive)." }

  const { z } = getCriticalValue(level)
  const zSquared = z ** 2
  const q = 1 - p
  const marginSquared = margin ** 2
  const raw = (zSquared * p * q) / marginSquared
  return { ok: true, data: { z, zSquared, p, q, margin, marginSquared, raw, n: ceilSampleSize(raw) } }
}
