// Testes da leitura de números e listas digitados pelo usuário (validation.ts).
import { describe, expect, it } from "vitest"
import { parseLocaleNumber, parsePairRows, parsePastedPairs, parseValueList, validateField } from "../validation"

describe("leitura de números", () => {
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

  it("vazio e textos inválidos", () => {
    expect(parseLocaleNumber("")).toEqual({ status: "empty" })
    expect(parseLocaleNumber("abc").status).toBe("invalid")
    expect(parseLocaleNumber("1,2,3").status).toBe("invalid")
  })
})

describe("regras de campo", () => {
  it("inteiro, mínimo exclusivo e vazio", () => {
    expect(validateField("10", { integer: true, min: 0, minExclusive: true }).value).toBe(10)
    expect(validateField("2,5", { integer: true }).error).toBeDefined()
    expect(validateField("0", { min: 0, minExclusive: true }).error).toBeDefined()
    expect(validateField("", {}).empty).toBe(true)
  })
})

describe("listas e pares", () => {
  it("linhas da tabela e dados colados", () => {
    const { pairs, rowErrors } = parsePairRows([{ x: "1", y: "2" }, { x: "", y: "" }, { x: "3", y: "" }])
    expect(pairs).toEqual([{ x: 1, y: 2 }])
    expect(rowErrors[2]).toBeDefined()
    expect(parsePastedPairs("1,5;2\n3\t4,25").rows).toEqual([{ x: "1,5", y: "2" }, { x: "3", y: "4,25" }])
    expect(parsePastedPairs("1;2;3").error).toBeDefined()
  })

  it("lista de valores com vírgula decimal e vários separadores", () => {
    expect(parseValueList("1,5; 2\n3\t4 1.250").values).toEqual([1.5, 2, 3, 4, 1250])
    expect(parseValueList("1; abc").error).toBeDefined()
  })
})
