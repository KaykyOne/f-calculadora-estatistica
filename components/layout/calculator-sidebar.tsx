"use client"

import { cn } from "cn"
import type { CalculatorEntry } from "@/components/calculators/registry"

interface CalculatorSidebarProps {
  items: CalculatorEntry[]
  activeId: string
  onSelect: (id: string) => void
}

export function CalculatorSidebar({ items, activeId, onSelect }: CalculatorSidebarProps) {
  const groups = [...new Set(items.map((i) => i.group))]
  return (
    <>
      {/* Desktop */}
      <nav aria-label="Calculadoras" className="hidden w-60 shrink-0 flex-col gap-4 border-r p-4 md:flex">
        <p className="px-2 text-sm font-semibold">Estatística Aplicada</p>
        {groups.map((group) => (
          <div key={group} className="flex flex-col gap-0.5">
            <p className="px-2 pb-1 text-xs text-muted-foreground">{group}</p>
            {items
              .filter((i) => i.group === group)
              .map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelect(item.id)}
                  aria-current={item.id === activeId ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                    item.id === activeId ? "bg-muted font-medium" : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                  )}
                >
                  <item.icon className="size-4 shrink-0" />
                  {item.shortTitle}
                </button>
              ))}
          </div>
        ))}
      </nav>

      {/* Mobile */}
      <nav aria-label="Calculadoras" className="flex gap-1 overflow-x-auto border-b p-2 md:hidden">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            aria-current={item.id === activeId ? "page" : undefined}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm",
              item.id === activeId ? "bg-muted font-medium" : "text-muted-foreground",
            )}
          >
            <item.icon className="size-4" />
            {item.shortTitle}
          </button>
        ))}
      </nav>
    </>
  )
}
