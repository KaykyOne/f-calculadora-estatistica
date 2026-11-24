// Testes da regressão linear simples (regression.ts).
import { describe, expect, it } from "vitest"
import { linearRegression, predict } from "../regression"
import { EXAMPLE_PAIRS, unwrap } from "./helpers"

describe("regressão linear", () => {
  it("exemplo com seis pares do material", () => {
    const r = unwrap(linearRegression(EXAMPLE_PAIRS))
    expect(r.a).toBeCloseTo(0.6, 10)
    expect(r.b).toBeCloseTo(-33.3333, 4)
    expect(r.r).toBeCloseTo(0.9865, 4)
    expect(r.rSquared).toBeCloseTo(0.9732, 4)
  })

  it("previsão e extrapolação", () => {
    const model = unwrap(linearRegression(EXAMPLE_PAIRS))
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
