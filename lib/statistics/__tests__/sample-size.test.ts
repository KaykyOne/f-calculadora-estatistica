// Testes do tamanho da amostra para média e proporção (sample-size.ts).
import { describe, expect, it } from "vitest"
import { ceilSampleSize, sampleSizeMean, sampleSizeProportion } from "../sample-size"
import { unwrap } from "./helpers"

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
