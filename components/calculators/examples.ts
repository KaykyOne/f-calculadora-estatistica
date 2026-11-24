/**
 * DADOS DE EXEMPLO ("Usar exemplo") E FORMULÁRIOS VAZIOS ("Limpar")
 *
 * Os exemplos são os exercícios do material didático.
 * ► Para trocar um exemplo (ex.: treinar com outro exercício), altere só este arquivo.
 *   Os números ficam como texto, do jeito que seriam digitados.
 */

import type { MeanCIForm } from "@/hooks/use-mean-confidence-interval"
import type { ProportionCIForm } from "@/hooks/use-proportion-confidence-interval"
import type { SampleSizeMeanForm } from "@/hooks/use-sample-size-mean"
import type { SampleSizeProportionForm } from "@/hooks/use-sample-size-proportion"
import type { PairRow } from "@/lib/statistics/validation"

// ─── Base (média e desvio padrão) ────────────────────────────────────────────
/** Resultado esperado: x̄ = 5, σ = 2, s ≈ 2,1381. */
export const DESCRIPTIVE_EXAMPLE = "2; 4; 4; 4; 5; 5; 7; 9"

// ─── IC para a média ─────────────────────────────────────────────────────────
export const MEAN_CI_EMPTY: MeanCIForm = { mean: "", sd: "", n: "", sdType: "population", level: 95 }
/** Resultado esperado: Em ≈ 12,47 e IC ≈ (307,53 ; 332,47). */
export const MEAN_CI_EXAMPLE: MeanCIForm = { mean: "320", sd: "45", n: "50", sdType: "population", level: 95 }

// ─── IC para proporção ───────────────────────────────────────────────────────
export const PROPORTION_CI_EMPTY: ProportionCIForm = { successes: "", n: "", level: 95 }
/** Resultado esperado: p = 0,40, Ep ≈ 0,0806, IC ≈ (0,3194 ; 0,4806). */
export const PROPORTION_CI_EXAMPLE: ProportionCIForm = { successes: "40", n: "100", level: 90 }

// ─── Tamanho da amostra para média ───────────────────────────────────────────
export const SAMPLE_SIZE_MEAN_EMPTY: SampleSizeMeanForm = { sd: "", margin: "", level: 95 }
/** Resultado esperado: 90% → 423 · 95% → 601 · 99% → 1037. */
export const SAMPLE_SIZE_MEAN_EXAMPLE: SampleSizeMeanForm = { sd: "1250", margin: "100", level: 95 }

// ─── Tamanho da amostra para proporção ───────────────────────────────────────
export const SAMPLE_SIZE_PROPORTION_EMPTY: SampleSizeProportionForm = {
  p: "",
  margin: "",
  unit: "decimal",
  unknownP: false,
  level: 95,
}
/** Resultado esperado: n = 2017. (Outros do material: p = 0,15 e Ep = 0,03 → 545; p desconhecido e Ep = 0,03 → 1068.) */
export const SAMPLE_SIZE_PROPORTION_EXAMPLE: SampleSizeProportionForm = {
  p: "0,30",
  margin: "0,02",
  unit: "decimal",
  unknownP: false,
  level: 95,
}

// ─── Pearson e regressão ─────────────────────────────────────────────────────
/** Resultado esperado: r ≈ 0,9865 · a = 0,6 · b ≈ −33,3333 · R² ≈ 0,9732. */
export const EXAMPLE_PAIRS: PairRow[] = [
  ["100", "50"],
  ["200", "80"],
  ["300", "130"],
  ["400", "190"],
  ["500", "260"],
  ["600", "350"],
].map(([x, y]) => ({ x, y }))

/** x usado na previsão do exemplo de regressão (ŷ ≈ 176,6667). */
export const REGRESSION_EXAMPLE_X = "350"
