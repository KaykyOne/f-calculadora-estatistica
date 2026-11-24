/**
 * Utilidades compartilhadas pelos testes (não é um arquivo de teste: não termina em .test.ts).
 */

import type { DataPair, StatResult } from "../types"

/** Extrai o resultado de um StatResult; se for erro, faz o teste falhar mostrando a mensagem. */
export function unwrap<T>(r: StatResult<T>): T {
  if (!r.ok) throw new Error(r.error)
  return r.data
}

/** Os seis pares do exercício do material (Pearson e regressão). */
export const EXAMPLE_PAIRS: DataPair[] = [
  { x: 100, y: 50 },
  { x: 200, y: 80 },
  { x: 300, y: 130 },
  { x: 400, y: 190 },
  { x: 500, y: 260 },
  { x: 600, y: 350 },
]
