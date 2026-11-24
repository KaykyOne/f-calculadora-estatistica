// Testes da tabela de valores críticos (critical-values.ts).
import { describe, expect, it } from "vitest"
import { getCriticalValue } from "../critical-values"

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
