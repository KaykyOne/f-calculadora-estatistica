/**
 * FORMATAÇÃO DE NÚMEROS PARA A TELA
 *
 * Toda a conta é feita com precisão completa; o arredondamento acontece SÓ aqui,
 * na hora de mostrar. Tudo no padrão brasileiro (vírgula decimal).
 *
 * Qual usar:
 * - fmt            → resultados com casas fixas:          12,4734
 * - fmtPlain       → números "redondos", sem zeros extras: 1.250  /  0,05
 * - fmtUnambiguous → conferência, SEM ponto de milhar:    1250   /  1,25
 * - fmtPercent     → porcentagem:                         40,00%
 * - texNum         → número dentro de fórmula KaTeX
 */

/** Opções de casas decimais do seletor no cabeçalho. */
export type Precision = 2 | 4 | 6
export const PRECISIONS: readonly Precision[] = [2, 4, 6]

/** Número com quantidade fixa de casas decimais. fmt(12.47344, 2) → "12,47". */
export function fmt(value: number, decimals: number = 4): string {
  const v = Object.is(value, -0) ? 0 : value // evita mostrar "-0,0000"
  return v.toLocaleString("pt-BR", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
}

/** Número sem zeros desnecessários no fim. fmtPlain(0.05) → "0,05"; fmtPlain(1250) → "1.250". */
export function fmtPlain(value: number, maxDecimals = 6): string {
  return value.toLocaleString("pt-BR", { maximumFractionDigits: maxDecimals })
}

/** Sem separador de milhar, para não haver dúvida: 1250 → "1250"; 1.25 → "1,25". */
export function fmtUnambiguous(value: number, maxDecimals = 10): string {
  return value.toLocaleString("pt-BR", { maximumFractionDigits: maxDecimals, useGrouping: false })
}

/** Decimal → porcentagem. fmtPercent(0.4) → "40,00%". */
export function fmtPercent(value: number, decimals: number = 2): string {
  return `${fmt(value * 100, decimals)}%`
}

/**
 * Número para usar dentro de uma fórmula KaTeX.
 * A vírgula vira "{,}" porque o KaTeX colocaria um espaço depois de uma vírgula comum.
 * - decimals: casas fixas (omitido = forma enxuta, como fmtPlain)
 * - wrapNegative: coloca negativos entre parênteses, ex.: "× (−3)"
 */
export function texNum(value: number, decimals?: number, wrapNegative = false): string {
  const s = (decimals === undefined ? fmtPlain(value) : fmt(value, decimals)).replace(/,/g, "{,}")
  return wrapNegative && value < 0 ? `(${s})` : s
}
