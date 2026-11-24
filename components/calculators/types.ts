/**
 * Props que toda calculadora recebe do layout (components/layout/calculator-layout.tsx),
 * e um utilitário para restaurar formulários do histórico.
 */

import type { Precision } from "@/lib/formatters"

export interface CalculatorProps {
  /** Casas decimais escolhidas no cabeçalho (2, 4 ou 6), usadas para exibir os resultados. */
  decimals: Precision
  /** id da calculadora no registry; usado para salvar no histórico. */
  calculatorId: string
  /** Formulário vindo do histórico, para autopreencher. undefined = começa vazio. */
  initialForm?: unknown
}

/**
 * Monta o formulário inicial: o vazio, sobrescrito pelo que veio do histórico.
 * Partir do vazio garante que nenhum campo fique faltando se o formato salvo for antigo.
 */
export function restoreForm<T extends object>(empty: T, saved: unknown): T {
  return saved && typeof saved === "object" && !Array.isArray(saved) ? { ...empty, ...(saved as Partial<T>) } : empty
}
