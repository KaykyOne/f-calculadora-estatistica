// Testes da aba Base: média, variância e desvio padrão (descriptive.ts).
import { describe, expect, it } from "vitest"
import { describe as describeData } from "../descriptive"
import { unwrap } from "./helpers"

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
})
