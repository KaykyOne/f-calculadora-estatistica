/**
 * FormulaDisplay — desenha uma fórmula matemática escrita em LaTeX, usando KaTeX.
 * Ex.: <FormulaDisplay tex="E_m = Z \cdot \frac{\sigma}{\sqrt{n}}" />
 * O CSS do KaTeX é importado em app/layout.tsx.
 */

import katex from "katex"
import { cn } from "cn"

interface FormulaDisplayProps {
  /** Fórmula em LaTeX. Dica: use String.raw`...` para não precisar escapar as barras. */
  tex: string
  /** true = em bloco (centralizada, rola na horizontal se não couber); false = dentro do texto. */
  block?: boolean
  className?: string
}

export function FormulaDisplay({ tex, block = true, className }: FormulaDisplayProps) {
  // throwOnError: false → se a fórmula tiver erro de LaTeX, mostra o texto em vermelho em vez de quebrar a página.
  const html = katex.renderToString(tex, { displayMode: block, throwOnError: false })
  return (
    <span
      className={cn(block && "block overflow-x-auto overflow-y-hidden py-1", className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
