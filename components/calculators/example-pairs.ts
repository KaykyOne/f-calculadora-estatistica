import type { PairRow } from "@/lib/statistics/validation"

/** Pares do exercício do material (Pearson e regressão). */
export const EXAMPLE_PAIRS: PairRow[] = [
  ["100", "50"],
  ["200", "80"],
  ["300", "130"],
  ["400", "190"],
  ["500", "260"],
  ["600", "350"],
].map(([x, y]) => ({ x, y }))
