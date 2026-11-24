"use client"

/**
 * ResultCard — card "Resultado".
 *
 * Mostra, de cima para baixo:
 *   1. a frase de conferência ("Calculando: ..."), para comparar com o enunciado;
 *   2. os valores calculados (os marcados com highlight ficam grandes, ocupando a linha toda);
 *   3. a interpretação em texto.
 * O botão "Copiar" copia tudo isso como texto simples.
 */

import { useState } from "react"
import { Check, Copy } from "lucide-react"
import { cn } from "cn"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export interface ResultItem {
  label: string
  /** Valor já formatado como texto. */
  value: string
  /** Destaca o resultado principal. */
  highlight?: boolean
}

interface ResultCardProps {
  title?: string
  items: ResultItem[]
  interpretation?: string
  /** Frase que repete o que foi calculado e com quais dados, para conferir com o enunciado. */
  summary?: string
}

export function ResultCard({ title = "Resultado", items, interpretation, summary }: ResultCardProps) {
  // Troca o botão para "Copiado" por 1,5 s depois de copiar.
  const [copied, setCopied] = useState(false)

  async function copy() {
    const text = [summary && `Calculando: ${summary}`, ...items.map((i) => `${i.label}: ${i.value}`), interpretation]
      .filter(Boolean)
      .join("\n")
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardAction>
          <Button variant="outline" size="sm" onClick={copy}>
            {copied ? <Check /> : <Copy />} {copied ? "Copiado" : "Copiar"}
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {summary && (
          <p className="rounded-lg border border-dashed px-3 py-2 text-sm">
            <span className="font-medium">Calculando: </span>
            {summary}
          </p>
        )}

        {/* Grade de valores: 1 coluna no celular, 2 no computador. */}
        <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {items.map((item) => (
            <div
              key={item.label}
              className={cn(
                "rounded-lg border px-3 py-2",
                item.highlight && "border-primary/30 bg-muted/60 sm:col-span-2",
              )}
            >
              <dt className="text-xs text-muted-foreground">{item.label}</dt>
              <dd className={cn("font-mono tabular-nums", item.highlight ? "text-lg font-semibold" : "text-sm")}>
                {item.value}
              </dd>
            </div>
          ))}
        </dl>

        {interpretation && <p className="text-sm leading-relaxed">{interpretation}</p>}
      </CardContent>
    </Card>
  )
}
