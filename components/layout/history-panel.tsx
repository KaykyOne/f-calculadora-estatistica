"use client"

/**
 * HistoryPanel — lista das contas salvas (abre pelo botão "Histórico" do cabeçalho).
 * Clicar numa conta abre a calculadora com os campos preenchidos.
 * O armazenamento fica em lib/history.ts; a gravação automática em hooks/use-history-recorder.ts.
 */

import { History, Trash2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CALCULATORS } from "@/components/calculators/registry"
import { clearHistory, removeHistoryEntry, type HistoryEntry } from "@/lib/history"

interface HistoryPanelProps {
  entries: HistoryEntry[]
  onOpen: (entry: HistoryEntry) => void
  onClose: () => void
}

/** "14:32" para contas de hoje; "21/11 14:32" para as de outros dias. */
function formatWhen(timestamp: number): string {
  const date = new Date(timestamp)
  const time = date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
  const isToday = date.toDateString() === new Date().toDateString()
  return isToday ? time : `${date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })} ${time}`
}

export function HistoryPanel({ entries, onOpen, onClose }: HistoryPanelProps) {
  // Ignora contas de calculadoras que não existem mais.
  const items = entries.flatMap((entry) => {
    const calc = CALCULATORS.find((c) => c.id === entry.calculatorId)
    return calc ? [{ entry, calc }] : []
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="size-4" /> Histórico
        </CardTitle>
        <CardDescription>Clique em uma conta para abri-la com os dados preenchidos.</CardDescription>
        <CardAction className="flex gap-2">
          {items.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              // Confirmação para não apagar tudo sem querer durante a apresentação.
              onClick={() => window.confirm("Apagar todo o histórico?") && clearHistory()}
            >
              <Trash2 /> Limpar histórico
            </Button>
          )}
          <Button variant="outline" size="icon-sm" onClick={onClose} aria-label="Fechar histórico">
            <X />
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhuma conta ainda. Cada conta com resultado é salva aqui automaticamente.
          </p>
        ) : (
          <ul className="flex max-h-96 flex-col gap-2 overflow-y-auto">
            {items.map(({ entry, calc }) => (
              <li key={entry.id} className="flex items-start gap-1 rounded-lg border">
                {/* A linha inteira é o botão de abrir. */}
                <button
                  type="button"
                  onClick={() => onOpen(entry)}
                  className="flex min-w-0 flex-1 flex-col gap-0.5 rounded-lg px-3 py-2 text-left outline-none hover:bg-muted/60 focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <span className="flex items-center gap-2 text-xs text-muted-foreground">
                    <calc.icon className="size-3.5" />
                    {calc.shortTitle} · {formatWhen(entry.createdAt)}
                  </span>
                  <span className="font-mono text-sm font-semibold">{entry.result}</span>
                  <span className="text-xs text-muted-foreground">{entry.summary}</span>
                </button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="m-1.5"
                  aria-label={`Remover do histórico: ${entry.result}`}
                  onClick={() => removeHistoryEntry(entry.id)}
                >
                  <Trash2 />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
