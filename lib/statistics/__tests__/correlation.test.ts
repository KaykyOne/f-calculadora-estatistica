// Testes da correlação de Pearson (correlation.ts).
import { describe, expect, it } from "vitest"
import { classifyCorrelation, pearsonCorrelation } from "../correlation"
import { EXAMPLE_PAIRS, unwrap } from "./helpers"

describe("Pearson", () => {
  it("exemplo com seis pares do material", () => {
    const r = unwrap(pearsonCorrelation(EXAMPLE_PAIRS))
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
    // 0,1 + 0,1 + 0,1 não dá exatamente 0,3 no computador: X continua "sem variação".
    const constant = [0.1, 0.1, 0.1].map((x, i) => ({ x, y: i }))
    expect(pearsonCorrelation(constant).ok).toBe(false)
  })
})
