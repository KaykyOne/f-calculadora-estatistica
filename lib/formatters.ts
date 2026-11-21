export type Precision = 2 | 4 | 6

export const PRECISIONS: readonly Precision[] = [2, 4, 6]

/** Formata em pt-BR com número fixo de casas decimais. */
export function fmt(value: number, decimals: number = 4): string {
  const v = Object.is(value, -0) ? 0 : value
  return v.toLocaleString("pt-BR", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
}

/** Formata sem zeros à direita desnecessários (para dados de entrada e constantes). */
export function fmtPlain(value: number, maxDecimals = 6): string {
  return value.toLocaleString("pt-BR", { maximumFractionDigits: maxDecimals })
}

export function fmtPercent(value: number, decimals: number = 2): string {
  return `${fmt(value * 100, decimals)}%`
}

/**
 * Número pronto para KaTeX (vírgula decimal sem espaço extra).
 * Sem `decimals`, usa a forma enxuta. `wrapNegative` coloca negativos entre parênteses.
 */
export function texNum(value: number, decimals?: number, wrapNegative = false): string {
  const s = (decimals === undefined ? fmtPlain(value) : fmt(value, decimals)).replace(/,/g, "{,}")
  return wrapNegative && value < 0 ? `(${s})` : s
}

/** Sem separador de milhar, para conferência sem ambiguidade: 1250 → "1250", 1.25 → "1,25". */
export function fmtUnambiguous(value: number, maxDecimals = 10): string {
  return value.toLocaleString("pt-BR", { maximumFractionDigits: maxDecimals, useGrouping: false })
}
