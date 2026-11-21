import type { DataPair } from "./types"

export type ParsedNumber =
  | { status: "empty" }
  | { status: "invalid" }
  | { status: "ok"; value: number }

/** Formato de milhar com ponto: "1.250", "2.200", "1.000.000" (não começa com 0). */
const THOUSANDS_DOT = /^[-+]?[1-9]\d{0,2}(\.\d{3})+$/

/**
 * Converte texto em número no padrão brasileiro.
 * - Vírgula é decimal: "1,5" → 1,5.
 * - Ponto em grupos de três dígitos é milhar: "2.200" → 2200, "1.234,5" → 1234,5.
 * - Ponto em outros formatos é decimal: "1.5" → 1,5 ; "0.025" → 0,025.
 */
export function parseLocaleNumber(raw: string): ParsedNumber {
  const s = raw.trim().replace(/\s+/g, "")
  if (s === "") return { status: "empty" }

  let normalized: string
  if (s.includes(",") && s.includes(".")) {
    if (!/^[-+]?\d{1,3}(\.\d{3})+,\d+$/.test(s)) return { status: "invalid" }
    normalized = s.replace(/\./g, "").replace(",", ".")
  } else if (THOUSANDS_DOT.test(s)) {
    normalized = s.replace(/\./g, "")
  } else {
    normalized = s.replace(",", ".")
  }
  if (!/^[-+]?(\d+\.?\d*|\.\d+)([eE][-+]?\d+)?$/.test(normalized)) return { status: "invalid" }
  const value = Number(normalized)
  return Number.isFinite(value) ? { status: "ok", value } : { status: "invalid" }
}

/** Indica se o ponto do texto foi interpretado como separador de milhar. */
export const usesThousandsDot = (raw: string) => THOUSANDS_DOT.test(raw.trim().replace(/\s+/g, ""))

export interface NumberRule {
  integer?: boolean
  min?: number
  minExclusive?: boolean
  max?: number
  maxExclusive?: boolean
}

export interface FieldCheck {
  value?: number
  error?: string
  empty: boolean
}

export function validateField(raw: string, rule: NumberRule = {}): FieldCheck {
  const parsed = parseLocaleNumber(raw)
  if (parsed.status === "empty") return { empty: true }
  if (parsed.status === "invalid") return { empty: false, error: "Digite um número válido (ex.: 12,5)." }

  const v = parsed.value
  if (rule.integer && !Number.isInteger(v)) {
    return { empty: false, error: "Deve ser um número inteiro." }
  }
  if (rule.min !== undefined && (rule.minExclusive ? v <= rule.min : v < rule.min))
    return { empty: false, error: `Deve ser ${rule.minExclusive ? "maior que" : "maior ou igual a"} ${rule.min}.` }
  if (rule.max !== undefined && (rule.maxExclusive ? v >= rule.max : v > rule.max))
    return { empty: false, error: `Deve ser ${rule.maxExclusive ? "menor que" : "menor ou igual a"} ${rule.max}.` }
  return { empty: false, value: v }
}

/**
 * Valida vários campos de uma vez.
 * `values` só é preenchido quando todos os campos estão preenchidos e válidos.
 */
export function validateFields<K extends string>(
  spec: Record<K, { raw: string; rule?: NumberRule }>,
): { values: Record<K, number> | null; errors: Partial<Record<K, string>>; incomplete: boolean } {
  const values = {} as Record<K, number>
  const errors: Partial<Record<K, string>> = {}
  let incomplete = false
  for (const key of Object.keys(spec) as K[]) {
    const check = validateField(spec[key].raw, spec[key].rule)
    if (check.error) errors[key] = check.error
    else if (check.empty) incomplete = true
    else values[key] = check.value as number
  }
  const ok = !incomplete && Object.keys(errors).length === 0
  return { values: ok ? values : null, errors, incomplete }
}

export interface PairRow {
  x: string
  y: string
}

/** Converte as linhas da tabela em pares numéricos. Linhas totalmente vazias são ignoradas. */
export function parsePairRows(rows: PairRow[]): { pairs: DataPair[]; rowErrors: Record<number, string> } {
  const pairs: DataPair[] = []
  const rowErrors: Record<number, string> = {}
  rows.forEach((row, i) => {
    const x = parseLocaleNumber(row.x)
    const y = parseLocaleNumber(row.y)
    if (x.status === "empty" && y.status === "empty") return
    if (x.status === "empty" || y.status === "empty") rowErrors[i] = "Preencha X e Y."
    else if (x.status === "invalid" || y.status === "invalid") rowErrors[i] = "Valor numérico inválido."
    else pairs.push({ x: x.value, y: y.value })
  })
  return { pairs, rowErrors }
}

/**
 * Lê pares colados: um par por linha, X e Y separados por ponto e vírgula,
 * tabulação ou espaço. A vírgula é reservada ao separador decimal.
 */
export function parsePastedPairs(text: string): { rows: PairRow[]; error?: string } {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
  const rows: PairRow[] = []
  for (const [i, line] of lines.entries()) {
    const parts = line.split(/[;\t ]+/).filter(Boolean)
    if (parts.length !== 2)
      return { rows: [], error: `Linha ${i + 1}: informe exatamente dois valores (X;Y).` }
    if (parts.some((p) => parseLocaleNumber(p).status !== "ok"))
      return { rows: [], error: `Linha ${i + 1}: valor numérico inválido.` }
    rows.push({ x: parts[0], y: parts[1] })
  }
  if (rows.length === 0) return { rows: [], error: "Nenhum par encontrado." }
  return { rows }
}

/**
 * Lê uma lista de valores separados por ponto e vírgula, espaço, tabulação ou quebra de linha.
 * A vírgula é reservada ao separador decimal.
 */
export function parseValueList(text: string): { values: number[]; error?: string } {
  const parts = text.split(/[;\s]+/).filter(Boolean)
  const values: number[] = []
  for (const [i, part] of parts.entries()) {
    const parsed = parseLocaleNumber(part)
    if (parsed.status !== "ok") return { values: [], error: `O ${i + 1}º valor ("${part}") não é um número válido.` }
    values.push(parsed.value)
  }
  return { values }
}
