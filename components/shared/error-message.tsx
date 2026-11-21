import { AlertTriangle, Info, XCircle } from "lucide-react"
import { cn } from "cn"

interface ErrorMessageProps {
  children: React.ReactNode
  variant?: "error" | "warning" | "info"
  className?: string
}

const STYLES = {
  error: { icon: XCircle, cls: "border-destructive/40 bg-destructive/5 text-destructive" },
  warning: { icon: AlertTriangle, cls: "border-amber-500/40 bg-amber-500/5 text-amber-800 dark:text-amber-300" },
  info: { icon: Info, cls: "border-border bg-muted/40 text-muted-foreground" },
}

export function ErrorMessage({ children, variant = "error", className }: ErrorMessageProps) {
  const { icon: Icon, cls } = STYLES[variant]
  return (
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
  hasFieldErrors?: boolean
  /** Mensagem exibida enquanto faltam dados. */
  emptyMessage?: string
}

/** Mostra o estado do cálculo: dados faltando, erro de domínio e alertas. */
export function CalculationStatus({
  incomplete,
  error,
  warnings,
  hasFieldErrors,
  emptyMessage = "Preencha todos os campos para ver o resultado.",
}: CalculationStatusProps) {
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
