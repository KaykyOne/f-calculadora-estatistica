export type ConfidenceLevel = 90 | 95 | 99

/** Resultado de uma função estatística: sucesso com dados ou erro explicativo. */
export type StatResult<T> = { ok: true; data: T } | { ok: false; error: string }

export interface CriticalValue {
  level: ConfidenceLevel
  confidence: number
  alpha: number
  halfAlpha: number
  z: number
}

export type DeviationType = "population" | "sample"

export interface MeanCIInput {
  mean: number
  sd: number
  n: number
  level: ConfidenceLevel
}

export interface MeanCIResult {
  z: number
  mean: number
  sd: number
  n: number
  sqrtN: number
  standardError: number
  margin: number
  lower: number
  upper: number
}

export interface ProportionCIInput {
  successes: number
  n: number
  level: ConfidenceLevel
}

export interface ProportionCIResult {
  z: number
  successes: number
  n: number
  p: number
  q: number
  variance: number
  standardError: number
  margin: number
  lower: number
  upper: number
}

export interface SampleSizeMeanInput {
  sd: number
  margin: number
  level: ConfidenceLevel
}

export interface SampleSizeMeanResult {
  z: number
  sd: number
  margin: number
  ratio: number
  raw: number
  n: number
}

export interface SampleSizeProportionInput {
  p: number
  margin: number
  level: ConfidenceLevel
}

export interface SampleSizeProportionResult {
  z: number
  zSquared: number
  p: number
  q: number
  margin: number
  marginSquared: number
  raw: number
  n: number
}

export interface DataPair {
  x: number
  y: number
}

export interface PairSums {
  n: number
  meanX: number
  meanY: number
  sumXY: number
  sumXX: number
  sumYY: number
  minX: number
  maxX: number
}

export type CorrelationStrength = "perfeita" | "forte" | "moderada" | "fraca" | "nula"

export interface CorrelationResult extends PairSums {
  r: number
  strength: CorrelationStrength
  direction: "positiva" | "negativa" | "nenhuma"
  interpretation: string
}

export interface RegressionResult extends PairSums {
  a: number
  b: number
  /** null quando Y não varia (r indefinido). */
  r: number | null
  rSquared: number | null
}

export interface Prediction {
  x: number
  y: number
  extrapolation: boolean
}

/** Estado devolvido pelos hooks de cálculo. */
export interface CalcState<T, K extends string = string> {
  result: T | null
  fieldErrors: Partial<Record<K, string>>
  /** Erro de domínio (ex.: falta de variabilidade). */
  error: string | null
  warnings: string[]
  /** Há campos obrigatórios ainda vazios. */
  incomplete: boolean
}

export interface DeviationRow {
  x: number
  deviation: number
  squared: number
}

export interface DescriptiveResult {
  n: number
  sum: number
  mean: number
  rows: DeviationRow[]
  /** Σ(xi − x̄)² */
  sumSquares: number
  populationVariance: number
  populationSd: number
  /** null quando n = 1 (divisão por n − 1 = 0). */
  sampleVariance: number | null
  sampleSd: number | null
}
