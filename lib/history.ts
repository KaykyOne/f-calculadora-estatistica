/**
 * HISTÓRICO DE CONTAS (localStorage)
 *
 * Guarda as contas feitas para mostrar e reabrir depois (botão "Histórico").
 * Cada entrada salva o formulário como estava (para autopreencher), a frase de
 * conferência e o resultado principal.
 *
 * Regras:
 * - A mesma conta (mesma calculadora + mesmos dados) não se repete: sobe para o topo.
 * - Guarda no máximo MAX_ENTRIES contas; as mais antigas saem.
 * - Os dados ficam só neste navegador (localStorage), sem servidor.
 *
 * ► Para mudar o limite de contas, altere MAX_ENTRIES.
 */

/** Chave usada no localStorage. */
const STORAGE_KEY = "calculadora-estatistica:historico"
/** Evento disparado nesta aba quando o histórico muda (o evento "storage" só avisa outras abas). */
const CHANGE_EVENT = "calculadora-estatistica:historico-mudou"
export const MAX_ENTRIES = 50

export interface HistoryEntry {
  id: string
  /** id da calculadora em components/calculators/registry.ts */
  calculatorId: string
  /** Formulário como estava, usado para autopreencher. */
  form: unknown
  /** Frase de conferência ("intervalo de 95% ... com x̄ = 320 ..."). */
  summary: string
  /** Resultado principal já formatado ("IC = (307,53 ; 332,47)"). */
  result: string
  /** Data/hora em milissegundos (Date.now()). */
  createdAt: number
}

/** O que a calculadora informa; id e data são gerados aqui. */
export type NewHistoryEntry = Omit<HistoryEntry, "id" | "createdAt">

/** Lê o texto salvo (JSON). Devolve "[]" se não houver nada ou o navegador bloquear o localStorage. */
export function readHistoryRaw(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? "[]"
  } catch {
    return "[]"
  }
}

/** Confere se um item lido do localStorage tem o formato esperado. */
function isEntry(v: unknown): v is HistoryEntry {
  if (!v || typeof v !== "object") return false
  const e = v as Record<string, unknown>
  return (
    typeof e.id === "string" &&
    typeof e.calculatorId === "string" &&
    typeof e.summary === "string" &&
    typeof e.result === "string" &&
    typeof e.createdAt === "number"
  )
}

/** Converte o texto salvo em lista de entradas, ignorando qualquer coisa corrompida. */
export function parseHistory(raw: string): HistoryEntry[] {
  try {
    const value: unknown = JSON.parse(raw)
    return Array.isArray(value) ? value.filter(isEntry) : []
  } catch {
    return []
  }
}

/** Salva a lista e avisa a tela para se atualizar. */
function write(entries: HistoryEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
  } catch {
    // Armazenamento cheio ou bloqueado (ex.: aba anônima): o histórico simplesmente não é salvo.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

/** Adiciona uma conta no topo. Se a mesma conta já existir, ela é removida da posição antiga. */
export function addHistoryEntry(entry: NewHistoryEntry) {
  const formKey = JSON.stringify(entry.form)
  const others = parseHistory(readHistoryRaw()).filter(
    (e) => !(e.calculatorId === entry.calculatorId && JSON.stringify(e.form) === formKey),
  )
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  write([{ ...entry, id, createdAt: Date.now() }, ...others].slice(0, MAX_ENTRIES))
}

export function removeHistoryEntry(id: string) {
  write(parseHistory(readHistoryRaw()).filter((e) => e.id !== id))
}

export function clearHistory() {
  write([])
}

/** Avisa `callback` quando o histórico mudar (nesta aba ou em outra). Usado por useHistory. */
export function subscribeHistory(callback: () => void) {
  window.addEventListener(CHANGE_EVENT, callback)
  window.addEventListener("storage", callback)
  return () => {
    window.removeEventListener(CHANGE_EVENT, callback)
    window.removeEventListener("storage", callback)
  }
}
