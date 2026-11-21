import { describe, expect, it } from "vitest"
import { getCriticalValue } from "../critical-values"
import { meanConfidenceInterval, proportionConfidenceInterval, proportionWarnings } from "../confidence-intervals"
import { ceilSampleSize, sampleSizeMean, sampleSizeProportion } from "../sample-size"
import { classifyCorrelation, pearsonCorrelation } from "../correlation"
import { linearRegression, predict } from "../regression"
import { parseLocaleNumber, parsePairRows, parsePastedPairs, parseValueList, validateField } from "../validation"
import { describe as describeData } from "../descriptive"
import type { DataPair, StatResult } from "../types"

function unwrap<T>(r: StatResult<T>): T {
  if (!r.ok) throw new Error(r.error)
  return r.data
}

const EXAMPLE: DataPair[] = [
  { x: 100, y: 50 },
  { x: 200, y: 80 },
  { x: 300, y: 130 },
  { x: 400, y: 190 },
  { x: 500, y: 260 },
  { x: 600, y: 350 },
]

describe("valores críticos", () => {
  it.each([
    [90, 0.1, 1.645],
    [95, 0.05, 1.96],
    [99, 0.01, 2.575],
  ] as const)("%i%%", (level, alpha, z) => {
    const cv = getCriticalValue(level)
    expect(cv.alpha).toBeCloseTo(alpha, 10)
    expect(cv.halfAlpha).toBeCloseTo(alpha / 2, 10)
    expect(cv.z).toBe(z)
  })
})

describe("IC para a média", () => {
  it("x̄ = 320, σ = 45, n = 50, 95%", () => {
    const r = unwrap(meanConfidenceInterval({ mean: 320, sd: 45, n: 50, level: 95 }))
    expect(r.margin).toBeCloseTo(12.4734, 3)
    expect(r.lower).toBeCloseTo(307.53, 2)
    expect(r.upper).toBeCloseTo(332.47, 2)
  })
  it("rejeita entradas inválidas", () => {
    expect(meanConfidenceInterval({ mean: 10, sd: -1, n: 10, level: 95 }).ok).toBe(false)
    expect(meanConfidenceInterval({ mean: 10, sd: 1, n: 0, level: 95 }).ok).toBe(false)
    expect(meanConfidenceInterval({ mean: 10, sd: 1, n: 2.5, level: 95 }).ok).toBe(false)
  })
})

describe("IC para proporção", () => {
  it("40 sucessos, n = 100, 90%", () => {
    const r = unwrap(proportionConfidenceInterval({ successes: 40, n: 100, level: 90 }))
    expect(r.p).toBeCloseTo(0.4, 10)
    expect(r.margin).toBeCloseTo(0.0806, 4)
    expect(r.lower).toBeCloseTo(0.3194, 4)
    expect(r.upper).toBeCloseTo(0.4806, 4)
    expect(proportionWarnings(r)).toEqual([])
  })
  it("usa p com precisão completa (860 de 2200)", () => {
    const r = unwrap(proportionConfidenceInterval({ successes: 860, n: 2200, level: 95 }))
    expect(r.p).toBe(860 / 2200)
    expect(r.margin).toBeCloseTo(1.96 * Math.sqrt(((860 / 2200) * (1340 / 2200)) / 2200), 12)
  })
  it("valida sucessos e alerta contagens pequenas", () => {
    expect(proportionConfidenceInterval({ successes: 11, n: 10, level: 95 }).ok).toBe(false)
    expect(proportionConfidenceInterval({ successes: -1, n: 10, level: 95 }).ok).toBe(false)
    const r = unwrap(proportionConfidenceInterval({ successes: 2, n: 50, level: 95 }))
    expect(proportionWarnings(r).length).toBeGreaterThan(0)
  })
})

describe("tamanho da amostra para média", () => {
  it.each([
    [90, 423],
    [95, 601],
    [99, 1037],
  ] as const)("σ = 1250, Em = 100, %i%% → %i", (level, n) => {
    expect(unwrap(sampleSizeMean({ sd: 1250, margin: 100, level })).n).toBe(n)
  })
  it("rejeita σ ou Em não positivos", () => {
    expect(sampleSizeMean({ sd: 0, margin: 100, level: 95 }).ok).toBe(false)
    expect(sampleSizeMean({ sd: 10, margin: 0, level: 95 }).ok).toBe(false)
  })
})

describe("tamanho da amostra para proporção", () => {
  it("p = 0,30, Ep = 0,02, 95% → 2017", () => {
    expect(unwrap(sampleSizeProportion({ p: 0.3, margin: 0.02, level: 95 })).n).toBe(2017)
  })
  it("p = 0,15, Ep = 0,03, 95% → 545", () => {
    expect(unwrap(sampleSizeProportion({ p: 0.15, margin: 0.03, level: 95 })).n).toBe(545)
  })
  it("p desconhecido (0,5), Ep = 0,03, 95% → 1068", () => {
    expect(unwrap(sampleSizeProportion({ p: 0.5, margin: 0.03, level: 95 })).n).toBe(1068)
  })
  it("rejeita proporções fora de (0, 1)", () => {
    expect(sampleSizeProportion({ p: 0, margin: 0.03, level: 95 }).ok).toBe(false)
    expect(sampleSizeProportion({ p: 1.2, margin: 0.03, level: 95 }).ok).toBe(false)
  })
})

describe("arredondamento do tamanho da amostra", () => {
  it("sempre para cima", () => {
    expect(ceilSampleSize(600.25)).toBe(601)
    expect(ceilSampleSize(422.0001)).toBe(423)
  })
  it("não soma uma unidade por erro de ponto flutuante", () => {
    expect(ceilSampleSize(600.0000000000001)).toBe(600)
    expect(ceilSampleSize(600)).toBe(600)
  })
})

describe("Pearson", () => {
  it("exemplo com seis pares", () => {
    const r = unwrap(pearsonCorrelation(EXAMPLE))
    expect(r.r).toBeCloseTo(0.9865, 4)
    expect(r.strength).toBe("forte")
    expect(r.direction).toBe("positiva")
  })
  it("correlação perfeita e negativa", () => {
    const r = unwrap(pearsonCorrelation([{ x: 1, y: 10 }, { x: 2, y: 8 }, { x: 3, y: 6 }]))
    expect(r.r).toBeCloseTo(-1, 12)
    expect(r.strength).toBe("perfeita")
  })
  it("classificação didática", () => {
    expect(classifyCorrelation(0.9999)).toBe("forte")
    expect(classifyCorrelation(0.5)).toBe("moderada")
    expect(classifyCorrelation(-0.1)).toBe("fraca")
    expect(classifyCorrelation(0)).toBe("nula")
  })
  it("erros sem variabilidade ou com poucos pares", () => {
    expect(pearsonCorrelation([{ x: 1, y: 2 }]).ok).toBe(false)
    expect(pearsonCorrelation([{ x: 1, y: 2 }, { x: 1, y: 3 }]).ok).toBe(false)
    expect(pearsonCorrelation([{ x: 1, y: 2 }, { x: 2, y: 2 }]).ok).toBe(false)
    const constant = [0.1, 0.1, 0.1].map((x, i) => ({ x, y: i }))
    expect(pearsonCorrelation(constant).ok).toBe(false)
  })
})

describe("regressão linear", () => {
  it("exemplo com seis pares", () => {
    const r = unwrap(linearRegression(EXAMPLE))
    expect(r.a).toBeCloseTo(0.6, 10)
    expect(r.b).toBeCloseTo(-33.3333, 4)
    expect(r.r).toBeCloseTo(0.9865, 4)
    expect(r.rSquared).toBeCloseTo(0.9732, 4)
  })
  it("previsão e extrapolação", () => {
    const model = unwrap(linearRegression(EXAMPLE))
    expect(predict(model, 350).y).toBeCloseTo(176.6667, 4)
    expect(predict(model, 350).extrapolation).toBe(false)
    expect(predict(model, 700).extrapolation).toBe(true)
  })
  it("exige variabilidade em X; Y constante deixa r indefinido", () => {
    expect(linearRegression([{ x: 2, y: 1 }, { x: 2, y: 5 }]).ok).toBe(false)
    const flat = unwrap(linearRegression([{ x: 1, y: 3 }, { x: 2, y: 3 }]))
    expect(flat.a).toBe(0)
    expect(flat.r).toBeNull()
  })
})

describe("validação de entradas", () => {
  it("vírgula e ponto decimais", () => {
    expect(parseLocaleNumber("1,5")).toEqual({ status: "ok", value: 1.5 })
    expect(parseLocaleNumber("1.5")).toEqual({ status: "ok", value: 1.5 })
    expect(parseLocaleNumber("1.234,5")).toEqual({ status: "ok", value: 1234.5 })
  })
  it("ponto em grupos de três dígitos é milhar", () => {
    expect(parseLocaleNumber("2.200")).toEqual({ status: "ok", value: 2200 })
    expect(parseLocaleNumber("1.250")).toEqual({ status: "ok", value: 1250 })
    expect(parseLocaleNumber("1.000.000")).toEqual({ status: "ok", value: 1000000 })
    expect(parseLocaleNumber("0.025")).toEqual({ status: "ok", value: 0.025 })
    expect(parseLocaleNumber("12.5")).toEqual({ status: "ok", value: 12.5 })
    expect(parseLocaleNumber("1.2345")).toEqual({ status: "ok", value: 1.2345 })
  })
  it("textos inválidos", () => {
    expect(parseLocaleNumber("")).toEqual({ status: "empty" })
    expect(parseLocaleNumber("abc").status).toBe("invalid")
    expect(parseLocaleNumber("1,2,3").status).toBe("invalid")
  })
  it("regras de campo", () => {
    expect(validateField("10", { integer: true, min: 0, minExclusive: true }).value).toBe(10)
    expect(validateField("2,5", { integer: true }).error).toBeDefined()
    expect(validateField("0", { min: 0, minExclusive: true }).error).toBeDefined()
    expect(validateField("", {}).empty).toBe(true)
  })
  it("linhas e dados colados", () => {
    const { pairs, rowErrors } = parsePairRows([{ x: "1", y: "2" }, { x: "", y: "" }, { x: "3", y: "" }])
    expect(pairs).toEqual([{ x: 1, y: 2 }])
    expect(rowErrors[2]).toBeDefined()
    expect(parsePastedPairs("1,5;2\n3\t4,25").rows).toEqual([{ x: "1,5", y: "2" }, { x: "3", y: "4,25" }])
    expect(parsePastedPairs("1;2;3").error).toBeDefined()
  })
})

describe("estatística descritiva (base)", () => {
  it("média, σ e s", () => {
    const r = unwrap(describeData([2, 4, 4, 4, 5, 5, 7, 9]))
    expect(r.n).toBe(8)
    expect(r.sum).toBe(40)
    expect(r.mean).toBe(5)
    expect(r.sumSquares).toBe(32)
    expect(r.populationVariance).toBe(4)
    expect(r.populationSd).toBe(2)
    expect(r.sampleVariance).toBeCloseTo(32 / 7, 12)
    expect(r.sampleSd).toBeCloseTo(2.13809, 5)
  })
  it("um único valor: s indefinido; lista vazia: erro", () => {
    const r = unwrap(describeData([10]))
    expect(r.populationSd).toBe(0)
    expect(r.sampleSd).toBeNull()
    expect(describeData([]).ok).toBe(false)
  })
  it("lê listas com vírgula decimal e vários separadores", () => {
    expect(parseValueList("1,5; 2\n3\t4 1.250").values).toEqual([1.5, 2, 3, 4, 1250])
    expect(parseValueList("1; abc").error).toBeDefined()
  })
})
