"use client"

import { useId } from "react"
import { Input } from "@/components/ui/input"
import { fmtUnambiguous } from "@/lib/formatters"
import { parseLocaleNumber, usesThousandsDot } from "@/lib/statistics/validation"

interface NumberFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  /** Símbolo matemático exibido ao lado do rótulo, ex.: "σ". */
  symbol?: string
  description?: string
  unit?: string
  placeholder?: string
  error?: string
  disabled?: boolean
  /** Texto de conferência para o valor lido. Padrão: o número sem separador de milhar. */
  readAs?: (value: number) => string
}

export function NumberField({
  label,
  value,
  onChange,
  symbol,
  description,
  unit,
  placeholder,
  error,
  disabled,
  readAs,
}: NumberFieldProps) {
  const id = useId()
  const hintId = `${id}-hint`
  const parsed = parseLocaleNumber(value)
  const reading =
    !error && !disabled && parsed.status === "ok"
      ? readAs
        ? readAs(parsed.value)
        : fmtUnambiguous(parsed.value) + (unit ? ` ${unit}` : "")
      : null

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
        {symbol && <span className="ml-1 font-serif text-muted-foreground italic">({symbol})</span>}
      </label>
      <div className="relative">
        <Input
          id={id}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={hintId}
          className={unit ? "pr-10" : undefined}
        />
        {unit && (
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-muted-foreground">
            {unit}
          </span>
        )}
      </div>
      <div id={hintId} className="text-xs">
        {reading && (
          <p className="font-medium text-emerald-700 dark:text-emerald-400">
            ✓ Lido como: <span className="font-mono">{reading}</span>
            {usesThousandsDot(value) && " (ponto lido como separador de milhar; para decimal use vírgula)"}
          </p>
        )}
        <p className={error ? "text-destructive" : "text-muted-foreground"}>{error ?? description}</p>
      </div>
    </div>
  )
}
