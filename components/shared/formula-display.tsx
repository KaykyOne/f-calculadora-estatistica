import katex from "katex"
import { cn } from "cn"

interface FormulaDisplayProps {
  tex: string
  /** Fórmula em bloco (centralizada) ou em linha. */
  block?: boolean
  className?: string
}

export function FormulaDisplay({ tex, block = true, className }: FormulaDisplayProps) {
  const html = katex.renderToString(tex, { displayMode: block, throwOnError: false })
  return (
    <span
      className={cn(block && "block overflow-x-auto overflow-y-hidden py-1", className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
