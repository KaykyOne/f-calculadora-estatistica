/**
 * Mensagens de erro, alerta e informação.
 *
 * - ErrorMessage: uma caixa colorida com ícone (vermelha, amarela ou cinza).
 * - CalculationStatus: decide quais mensagens mostrar a partir do estado de um hook de cálculo.
 */

import { AlertTriangle, Info, XCircle } from "lucide-react"
import { cn } from "cn"

interface ErrorMessageProps {
  children: React.ReactNode
  /** error = vermelho (impede o cálculo) · warning = amarelo (alerta) · info = cinza (dica) */
  variant?: "error" | "warning" | "info"
  className?: string
}

/** Ícone e cores de cada tipo de mensagem. */
const STYLES = {
  error: { icon: XCircle, cls: "border-destructive/40 bg-destructive/5 text-destructive" },
  warning: { icon: AlertTriangle, cls: "border-amber-500/40 bg-amber-500/5 text-amber-800 dark:text-amber-300" },
  info: { icon: Info, cls: "border-border bg-muted/40 text-muted-foreground" },
}

export function ErrorMessage({ children, variant = "error", className }: ErrorMessageProps) {
  const { icon: Icon, cls } = STYLES[variant]
  return (
    // role="alert" faz leitores de tela anunciarem a mensagem assim que ela aparece.
    <div role={variant === "info" ? "status" : "alert"} className={cn("flex gap-2 rounded-lg border p-3 text-sm", cls, className)}>
      <Icon className="mt-0.5 size-4 shrink-0" />
      <div>{children}</div>
    </div>
  )
}

interface CalculationStatusProps {
  incomplete: boolean
  error: string | null
  warnings: string[]
  /** Erros por campo do hook; se houver algum, mostra "Corrija os campos destacados". */
  fieldErrors?: Partial<Record<string, string>>
  /** Mensagem exibida enquanto faltam dados. */
  emptyMessage?: string
}

/**
 * Mostra o estado do cálculo embaixo do formulário. Basta repassar o estado do hook:
 *   <CalculationStatus {...state} />
 * Prioridade: erro da conta > campos com erro > campos vazios. Alertas aparecem sempre.
 */
export function CalculationStatus({
  incomplete,
  error,
  warnings,
  fieldErrors = {},
  emptyMessage = "Preencha todos os campos para ver o resultado.",
}: CalculationStatusProps) {
  const hasFieldErrors = Object.keys(fieldErrors).length > 0
  return (
    <>
      {error && <ErrorMessage>{error}</ErrorMessage>}
      {hasFieldErrors && !error && <ErrorMessage>Corrija os campos destacados para calcular.</ErrorMessage>}
      {incomplete && !error && !hasFieldErrors && <ErrorMessage variant="info">{emptyMessage}</ErrorMessage>}
      {warnings.map((w) => (
        <ErrorMessage key={w} variant="warning">
          {w}
        </ErrorMessage>
      ))}
    </>
  )
}
