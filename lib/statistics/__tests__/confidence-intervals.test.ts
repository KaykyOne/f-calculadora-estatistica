// Testes dos intervalos de confiança para média e proporção (confidence-intervals.ts).
import { describe, expect, it } from "vitest"
import { meanConfidenceInterval, proportionConfidenceInterval, proportionWarnings } from "../confidence-intervals"
import { unwrap } from "./helpers"

describe("IC para a média", () => {
  it("x̄ = 320, σ = 45, n = 50, 95% (exemplo do material)", () => {
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
  it("40 sucessos, n = 100, 90% (exemplo do material)", () => {
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
