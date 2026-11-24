/**
 * useHistoryRecorder — salva a conta atual no histórico automaticamente.
 *
 * A calculadora chama este hook com a conta pronta (ou null enquanto não há resultado).
 * A conta só é salva depois de SAVE_DELAY_MS sem mudanças, para não guardar cada
 * tecla digitada (ex.: "3", "32", "320").
 *
 * ► Para salvar mais rápido ou mais devagar, altere SAVE_DELAY_MS.
 */

import { useEffect } from "react"
import { addHistoryEntry, type NewHistoryEntry } from "@/lib/history"

const SAVE_DELAY_MS = 1500

export function useHistoryRecorder(calculatorId: string, entry: Omit<NewHistoryEntry, "calculatorId"> | null) {
  // Compara pelo conteúdo (texto), não pelo objeto, para não reiniciar a espera a cada renderização.
  const serialized = entry ? JSON.stringify(entry) : null

  useEffect(() => {
    if (!serialized) return
    const timer = setTimeout(() => addHistoryEntry({ calculatorId, ...JSON.parse(serialized) }), SAVE_DELAY_MS)
    // Se a conta mudar antes do tempo, cancela o salvamento anterior.
    return () => clearTimeout(timer)
  }, [calculatorId, serialized])
}
