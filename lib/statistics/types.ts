/**
 * TIPOS COMPARTILHADOS DA PARTE MATEMÁTICA
 *
 * Aqui ficam só as "formas" dos dados (interfaces), sem nenhuma conta.
 * Cada função em lib/statistics/ recebe um "...Input" e devolve um "...Result".
 * Os resultados guardam também os valores intermediários (raiz de n, somatórios etc.)
 * porque a tela usa esses números para montar o passo a passo.
 */

// ─── Gerais ──────────────────────────────────────────────────────────────────

/** Graus de confiança aceitos pelo material: 90%, 95% ou 99%. */
export type ConfidenceLevel = 90 | 95 | 99

/**
 * Resultado de qualquer função estatística.
 * - Deu certo  → { ok: true, data: ... }
 * - Deu errado → { ok: false, error: "mensagem para o usuário" }
 * Assim a conta nunca devolve NaN/Infinity: ela devolve uma explicação.
 */
export type StatResult<T> = { ok: true; data: T } | { ok: false; error: string }

/**
 * Estado que todo hook de cálculo devolve para a tela.
 * K = nomes dos campos do formulário (para mostrar o erro embaixo do campo certo).
 */
export interface CalcState<T, K extends string = string> {
  /** Resultado da conta; null enquanto faltam dados ou há erro. */
  result: T | null
  /** Erros de cada campo, ex.: { n: "Deve ser um número inteiro." }. */
  fieldErrors: Partial<Record<K, string>>
  /** Erro da conta em si (ex.: "todos os X são iguais"). */
  error: string | null
  /** Alertas que não impedem o cálculo (ex.: "use t de Student"). */
  warnings: string[]
  /** true quando ainda há campo obrigatório vazio. */
  incomplete: boolean
}

// ─── Valores críticos ────────────────────────────────────────────────────────

export interface CriticalValue {
  /** 90, 95 ou 99 */
  level: ConfidenceLevel
  /** Confiança em decimal: 0,90 / 0,95 / 0,99 */
  confidence: number
  /** α = 1 − confiança */
  alpha: number
  /** α/2 (metade em cada cauda da curva normal) */
  halfAlpha: number
  /** Zα/2 da tabela do material */
  z: number
}

// ─── Estatística descritiva (aba Base) ───────────────────────────────────────

/** Uma linha da tabela de desvios: xi, xi − x̄ e (xi − x̄)². */
export interface DeviationRow {
  x: number
  deviation: number
  squared: number
}

export interface DescriptiveResult {
  n: number
  /** Σx */
  sum: number
  /** x̄ */
  mean: number
  rows: DeviationRow[]
  /** Σ(xi − x̄)² */
  sumSquares: number
  /** σ² = Σ(xi − x̄)² / n */
  populationVariance: number
  /** σ = √σ² */
  populationSd: number
  /** s² = Σ(xi − x̄)² / (n − 1). null quando n = 1 (divisão por zero). */
  sampleVariance: number | null
  /** s = √s². null quando n = 1. */
  sampleSd: number | null
}

// ─── Intervalo de confiança ──────────────────────────────────────────────────

/** Qual desvio o usuário informou: populacional (σ) ou amostral (s). */
export type DeviationType = "population" | "sample"

export interface MeanCIInput {
  /** x̄ */
  mean: number
  /** σ ou s */
  sd: number
  n: number
  level: ConfidenceLevel
}

export interface MeanCIResult {
  z: number
  mean: number
  sd: number
  n: number
  /** √n */
  sqrtN: number
  /** σ / √n (erro padrão) */
  standardError: number
  /** Em = Z · σ/√n */
  margin: number
  /** x̄ − Em */
  lower: number
  /** x̄ + Em */
  upper: number
}

export interface ProportionCIInput {
  /** x = quantidade de sucessos */
  successes: number
  n: number
  level: ConfidenceLevel
}

export interface ProportionCIResult {
  z: number
  successes: number
  n: number
  /** p = x / n */
  p: number
  /** 1 − p */
  q: number
  /** p(1 − p) / n */
  variance: number
  /** √(p(1 − p) / n) */
  standardError: number
  /** Ep = Z · √(p(1 − p)/n) */
  margin: number
  lower: number
  upper: number
}

// ─── Tamanho da amostra ──────────────────────────────────────────────────────

export interface SampleSizeMeanInput {
  /** σ */
  sd: number
  /** Em */
  margin: number
  level: ConfidenceLevel
}

export interface SampleSizeMeanResult {
  z: number
  sd: number
  margin: number
  /** Z · σ / Em (o que fica dentro do parêntese) */
  ratio: number
  /** n antes de arredondar */
  raw: number
  /** n final, arredondado para cima */
  n: number
}

export interface SampleSizeProportionInput {
  /** p em decimal (0,30) */
  p: number
  /** Ep em decimal (0,02) */
  margin: number
  level: ConfidenceLevel
}

export interface SampleSizeProportionResult {
  z: number
  /** Z² */
  zSquared: number
  p: number
  /** 1 − p */
  q: number
  margin: number
  /** Ep² */
  marginSquared: number
  /** n antes de arredondar */
  raw: number
  /** n final, arredondado para cima */
  n: number
}

// ─── Correlação e regressão ──────────────────────────────────────────────────

/** Um par observado (X, Y). */
export interface DataPair {
  x: number
  y: number
}

/** Médias e somatórios usados tanto por Pearson quanto pela regressão. */
export interface PairSums {
  n: number
  /** x̄ */
  meanX: number
  /** ȳ */
  meanY: number
  /** Σ(xi − x̄)(yi − ȳ) */
  sumXY: number
  /** Σ(xi − x̄)² */
  sumXX: number
  /** Σ(yi − ȳ)² */
  sumYY: number
  /** Menor e maior X observados (usados para detectar extrapolação). */
  minX: number
  maxX: number
}

/** Classificação didática da correlação pelo valor de |r|. */
export type CorrelationStrength = "perfeita" | "forte" | "moderada" | "fraca" | "nula"

export interface CorrelationResult extends PairSums {
  r: number
  strength: CorrelationStrength
  direction: "positiva" | "negativa" | "nenhuma"
  /** Frase pronta explicando o resultado. */
  interpretation: string
}

export interface RegressionResult extends PairSums {
  /** Coeficiente angular (inclinação da reta). */
  a: number
  /** Intercepto (onde a reta corta o eixo Y). */
  b: number
  /** Pearson; null quando Y não varia (r indefinido). */
  r: number | null
  /** R² = r²; null quando r é indefinido. */
  rSquared: number | null
}

/** Previsão ŷ para um valor de x. */
export interface Prediction {
  x: number
  y: number
  /** true se x está fora do intervalo de X observado (previsão menos confiável). */
  extrapolation: boolean
}
