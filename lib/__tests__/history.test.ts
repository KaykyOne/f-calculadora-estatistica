// Testes do histórico (lib/history.ts), com um localStorage falso em memória.
import { beforeEach, describe, expect, it, vi } from "vitest"
import { addHistoryEntry, clearHistory, MAX_ENTRIES, parseHistory, readHistoryRaw, removeHistoryEntry } from "../history"

beforeEach(() => {
  const store = new Map<string, string>()
  vi.stubGlobal("localStorage", {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
  })
  vi.stubGlobal("window", new EventTarget())
})

const read = () => parseHistory(readHistoryRaw())
const entry = (calculatorId: string, n: string) => ({ calculatorId, form: { n }, summary: `n = ${n}`, result: n })

describe("histórico", () => {
  it("adiciona no topo e não repete a mesma conta", () => {
    addHistoryEntry(entry("ic-media", "50"))
    addHistoryEntry(entry("ic-media", "60"))
    addHistoryEntry(entry("ic-media", "50"))
    expect(read().map((e) => e.form)).toEqual([{ n: "50" }, { n: "60" }])
  })

  it("mesmos dados em calculadoras diferentes são contas diferentes", () => {
    addHistoryEntry(entry("ic-media", "50"))
    addHistoryEntry(entry("amostra-media", "50"))
    expect(read()).toHaveLength(2)
  })

  it(`guarda no máximo ${MAX_ENTRIES} contas`, () => {
    for (let i = 0; i < MAX_ENTRIES + 5; i++) addHistoryEntry(entry("ic-media", String(i)))
    expect(read()).toHaveLength(MAX_ENTRIES)
    expect(read()[0].form).toEqual({ n: String(MAX_ENTRIES + 4) })
  })

  it("remove uma entrada e limpa tudo", () => {
    addHistoryEntry(entry("ic-media", "1"))
    addHistoryEntry(entry("ic-media", "2"))
    removeHistoryEntry(read()[0].id)
    expect(read().map((e) => e.result)).toEqual(["1"])
    clearHistory()
    expect(read()).toEqual([])
  })

  it("ignora dados corrompidos", () => {
    expect(parseHistory("não é json")).toEqual([])
    expect(parseHistory('[{"id":1}]')).toEqual([])
  })
})
