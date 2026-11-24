/**
 * VALORES CRÍTICOS Zα/2
 *
 * Tabela única usada por TODAS as calculadoras (IC e tamanho da amostra).
 * Os valores são os do material didático (2,575 e não o exato 2,5758),
 * para que os resultados batam com os da professora.
 *
 * ► Para mudar um valor de Z, altere só a tabela TABLE abaixo.
 */

import type { ConfidenceLevel, CriticalValue } from "./types"

/** Graus de confiança na ordem em que aparecem nos botões. */
export const CONFIDENCE_LEVELS: readonly ConfidenceLevel[] = [90, 95, 99]

/** confiança → { α, Zα/2 } */
const TABLE: Record<ConfidenceLevel, { alpha: number; z: number }> = {
  90: { alpha: 0.1, z: 1.645 },
  95: { alpha: 0.05, z: 1.96 },
  99: { alpha: 0.01, z: 2.575 },
}

/**
 * Devolve todos os dados do valor crítico para um grau de confiança.
 * Ex.: getCriticalValue(95) → { confidence: 0.95, alpha: 0.05, halfAlpha: 0.025, z: 1.96 }
 */
export function getCriticalValue(level: ConfidenceLevel): CriticalValue {
  const { alpha, z } = TABLE[level]
  return { level, confidence: level / 100, alpha, halfAlpha: alpha / 2, z }
}
