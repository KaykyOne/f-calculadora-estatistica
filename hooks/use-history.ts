/**
 * useHistory — lista de contas salvas, sempre atualizada.
 *
 * Usa useSyncExternalStore, o jeito do React de ler dados de fora dele (localStorage).
 * No servidor (build estático) a lista começa vazia e é preenchida ao abrir a página.
 */

import { useMemo, useSyncExternalStore } from "react"
import { parseHistory, readHistoryRaw, subscribeHistory, type HistoryEntry } from "@/lib/history"

export function useHistory(): HistoryEntry[] {
  const raw = useSyncExternalStore(subscribeHistory, readHistoryRaw, () => "[]")
  return useMemo(() => parseHistory(raw), [raw])
}
