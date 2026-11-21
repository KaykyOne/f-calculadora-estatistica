"use client"

import { useState } from "react"
import { ClipboardPaste, Plus, RotateCcw, Sparkles, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { parsePastedPairs, type PairRow } from "@/lib/statistics/validation"
import { ErrorMessage } from "./error-message"

interface DataPairsTableProps {
  rows: PairRow[]
  onChange: (rows: PairRow[]) => void
  rowErrors?: Record<number, string>
  onExample?: () => void
  xLabel?: string
  yLabel?: string
}

export const emptyRows = (count = 3): PairRow[] => Array.from({ length: count }, () => ({ x: "", y: "" }))

export function DataPairsTable({ rows, onChange, rowErrors = {}, onExample, xLabel = "X", yLabel = "Y" }: DataPairsTableProps) {
  const [pasteOpen, setPasteOpen] = useState(false)
  const [pasteText, setPasteText] = useState("")
  const [pasteError, setPasteError] = useState<string>()

  const update = (i: number, key: keyof PairRow, value: string) =>
    onChange(rows.map((row, j) => (j === i ? { ...row, [key]: value } : row)))

  function importPaste() {
    const { rows: parsed, error } = parsePastedPairs(pasteText)
    if (error) return setPasteError(error)
    onChange(parsed)
    setPasteText("")
    setPasteError(undefined)
    setPasteOpen(false)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {onExample && (
          <Button variant="outline" size="sm" onClick={onExample}>
            <Sparkles /> Usar exemplo
          </Button>
        )}
        <Button variant="outline" size="sm" onClick={() => setPasteOpen((o) => !o)} aria-expanded={pasteOpen}>
          <ClipboardPaste /> Colar dados
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onChange(emptyRows())}>
          <RotateCcw /> Limpar
        </Button>
      </div>

      {pasteOpen && (
        <div className="flex flex-col gap-2 rounded-lg border p-3">
          <label htmlFor="paste-pairs" className="text-sm font-medium">
            Um par por linha, X e Y separados por ponto e vírgula, tabulação ou espaço
          </label>
          <textarea
            id="paste-pairs"
            rows={5}
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            placeholder={"100;50\n200;80\n1,5;2,25"}
            className="rounded-lg border border-input bg-transparent p-2 font-mono text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
          />
          <p className="text-xs text-muted-foreground">
            A vírgula é o separador decimal. Colunas copiadas de uma planilha funcionam diretamente. Os dados atuais serão substituídos.
          </p>
          {pasteError && <ErrorMessage>{pasteError}</ErrorMessage>}
          <Button size="sm" className="w-fit" onClick={importPaste}>
            Importar pares
          </Button>
        </div>
      )}

      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-muted-foreground">
            <th className="w-10 pb-1 font-normal">#</th>
            <th className="pb-1 font-medium">{xLabel}</th>
            <th className="pb-1 pl-2 font-medium">{yLabel}</th>
            <th className="w-10" />
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="align-top">
              <td className="pt-2.5 text-muted-foreground tabular-nums">{i + 1}</td>
              <td className="py-1">
                <Input
                  aria-label={`${xLabel} da linha ${i + 1}`}
                  inputMode="decimal"
                  value={row.x}
                  onChange={(e) => update(i, "x", e.target.value)}
                  aria-invalid={rowErrors[i] ? true : undefined}
                />
              </td>
              <td className="py-1 pl-2">
                <Input
                  aria-label={`${yLabel} da linha ${i + 1}`}
                  inputMode="decimal"
                  value={row.y}
                  onChange={(e) => update(i, "y", e.target.value)}
                  aria-invalid={rowErrors[i] ? true : undefined}
                />
                {rowErrors[i] && <p className="mt-1 text-xs text-destructive">{rowErrors[i]}</p>}
              </td>
              <td className="py-1 pl-1">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Remover linha ${i + 1}`}
                  onClick={() => onChange(rows.filter((_, j) => j !== i))}
                  disabled={rows.length <= 1}
                >
                  <Trash2 />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Button variant="outline" size="sm" className="w-fit" onClick={() => onChange([...rows, { x: "", y: "" }])}>
        <Plus /> Adicionar linha
      </Button>
    </div>
  )
}
