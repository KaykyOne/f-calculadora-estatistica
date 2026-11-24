"use client"

/**
 * CalculatorSidebar — navegação entre as calculadoras.
 * Computador: barra lateral com os itens separados por grupo; os itens "extra"
 *             (ex.: aba Base) ficam discretos no rodapé, e os "collapsed" (ex.: Pearson)
 *             só aparecem depois de clicar no botão "‹".
 * Celular: faixa horizontal de abas que rola para o lado (extras no fim, mesmo botão "‹").
 * Os itens vêm de components/calculators/registry.ts.
 */

import { useState } from "react"
import { ChevronLeft } from "lucide-react"
import { cn } from "cn"
import type { CalculatorEntry } from "@/components/calculators/registry"

interface CalculatorSidebarProps {
  items: CalculatorEntry[]
  activeId: string
  onSelect: (id: string) => void
}

export function CalculatorSidebar({ items, activeId, onSelect }: CalculatorSidebarProps) {
  const main = items.filter((i) => !i.extra)
  const extras = items.filter((i) => i.extra && !i.collapsed)
  const hidden = items.filter((i) => i.collapsed)

  // Itens escondidos: abertos ao clicar no "‹", ou se um deles for a aba ativa
  // (ex.: aberta pelo histórico), para a aba atual nunca ficar invisível.
  const [toggled, setToggled] = useState(false)
  const showHidden = toggled || hidden.some((i) => i.id === activeId)

  /** Botão "‹" que mostra/esconde os itens escondidos. Gira para baixo quando aberto. */
  const toggleButton = (className?: string) => (
    <button
      type="button"
      onClick={() => setToggled((t) => !t)}
      aria-expanded={showHidden}
      aria-label={showHidden ? "Esconder mais calculadoras" : "Mostrar mais calculadoras"}
      className={cn(
        "flex items-center justify-center rounded-md text-muted-foreground/70 outline-none hover:bg-muted/60 hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50",
        className,
      )}
    >
      <ChevronLeft className={cn("size-3.5 transition-transform", showHidden && "-rotate-90")} />
    </button>
  )
  // Grupos na ordem em que aparecem na lista (Set remove repetidos).
  const groups = [...new Set(main.map((i) => i.group))]

  /** Um botão da barra lateral (computador). `subtle` = estilo apagado dos extras. */
  const desktopItem = (item: CalculatorEntry, subtle = false) => (
    <button
      key={item.id}
      type="button"
      onClick={() => onSelect(item.id)}
      aria-current={item.id === activeId ? "page" : undefined}
      className={cn(
        "flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        item.id === activeId
          ? "bg-muted font-medium"
          : cn("text-muted-foreground hover:bg-muted/60 hover:text-foreground", subtle && "text-xs opacity-70"),
      )}
    >
      <item.icon className={cn("shrink-0", subtle ? "size-3.5" : "size-4")} />
      {item.shortTitle}
    </button>
  )

  return (
    <>
      {/* Computador (md para cima). sticky + h-screen mantém o rodapé visível. */}
      <nav
        aria-label="Calculadoras"
        className="hidden w-60 shrink-0 flex-col gap-4 overflow-y-auto border-r p-4 md:sticky md:top-0 md:flex md:h-screen"
      >
        <p className="px-2 text-sm font-semibold">Estatística Aplicada</p>
        {groups.map((group) => (
          <div key={group} className="flex flex-col gap-0.5">
            <p className="px-2 pb-1 text-xs text-muted-foreground">{group}</p>
            {main.filter((i) => i.group === group).map((item) => desktopItem(item))}
          </div>
        ))}

        {/* Rodapé com as abas extras (mt-auto empurra para baixo). */}
        {extras.length > 0 && (
          <div className="mt-auto flex flex-col gap-0.5 border-t pt-3">
            <p className="px-2 pb-1 text-[0.7rem] text-muted-foreground/70">Extra</p>
            {extras.map((item) => desktopItem(item, true))}
            {hidden.length > 0 && (
              <>
                {/* À direita: no canto esquerdo o indicador do Next (modo dev) cobre o botão. */}
                {toggleButton("mr-1 size-6 self-end")}
                {showHidden && hidden.map((item) => desktopItem(item, true))}
              </>
            )}
          </div>
        )}
      </nav>

      {/* Celular (abaixo de md) */}
      <nav aria-label="Calculadoras" className="flex gap-1 overflow-x-auto border-b p-2 md:hidden">
        {[...main, ...extras, ...(showHidden ? hidden : [])].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            aria-current={item.id === activeId ? "page" : undefined}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm",
              item.id === activeId ? "bg-muted font-medium" : "text-muted-foreground",
              item.extra && item.id !== activeId && "opacity-70",
            )}
          >
            <item.icon className="size-4" />
            {item.shortTitle}
          </button>
        ))}
        {hidden.length > 0 && toggleButton("shrink-0 px-2")}
      </nav>
    </>
  )
}
