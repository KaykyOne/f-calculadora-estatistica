/**
 * Props que toda calculadora recebe do layout (components/layout/calculator-layout.tsx).
 */

import type { Precision } from "@/lib/formatters"

export interface CalculatorProps {
  /** Casas decimais escolhidas no cabeçalho (2, 4 ou 6), usadas para exibir os resultados. */
  decimals: Precision
}
