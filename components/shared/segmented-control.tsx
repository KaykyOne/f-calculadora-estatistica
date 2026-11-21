"use client"

import { useId } from "react"
import { cn } from "cn"

interface SegmentedControlProps<T extends string | number> {
  label: string
  value: T
  options: readonly { value: T; label: string }[]
  onChange: (value: T) => void
}

/** Grupo de opções exclusivas (radiogroup) exibido como botões lado a lado. */
export function SegmentedControl<T extends string | number>({ label, value, options, onChange }: SegmentedControlProps<T>) {
  const labelId = useId()
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium" id={labelId}>
        {label}
      </span>
      <div role="radiogroup" aria-labelledby={labelId} className="inline-flex w-fit rounded-lg border p-0.5">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={value === opt.value}
            onClick={() => onChange(opt.value)}
            className={cn(
              "rounded-md px-3 py-1 text-sm transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
              value === opt.value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted",
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}
