"use client"

import {
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Scatter,
  ScatterChart as RechartsScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { fmtPlain } from "@/lib/formatters"
import type { DataPair } from "@/lib/statistics/types"

interface ScatterChartProps {
  points: DataPair[]
  /** Reta ŷ = ax + b desenhada no intervalo [fromX, toX]. */
  line?: { a: number; b: number; fromX: number; toX: number }
  xLabel?: string
  yLabel?: string
}

const tick = { fontSize: 12, fill: "var(--muted-foreground)" }
const format = (v: unknown) => (typeof v === "number" ? fmtPlain(v, 4) : String(v))

export function ScatterChart({ points, line, xLabel = "X", yLabel = "Y" }: ScatterChartProps) {
  const lineData = line
    ? [
        { x: line.fromX, y: line.a * line.fromX + line.b },
        { x: line.toX, y: line.a * line.toX + line.b },
      ]
    : []

  return (
    <div className="h-72 w-full" role="img" aria-label={`Gráfico de dispersão de ${yLabel} em função de ${xLabel}`}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsScatterChart margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
          <XAxis type="number" dataKey="x" name={xLabel} tick={tick} tickFormatter={format} domain={["auto", "auto"]} stroke="var(--border)" />
          <YAxis type="number" dataKey="y" name={yLabel} tick={tick} tickFormatter={format} domain={["auto", "auto"]} stroke="var(--border)" width={56} />
          <Tooltip
            formatter={format}
            cursor={{ strokeDasharray: "3 3", stroke: "var(--muted-foreground)" }}
            contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12, color: "var(--popover-foreground)" }}
          />
          {line && <Legend wrapperStyle={{ fontSize: 12, color: "var(--muted-foreground)" }} />}
          <Scatter
            name="Observações"
            data={points}
            fill="var(--series-1)"
            stroke="var(--card)"
            strokeWidth={2}
            isAnimationActive={false}
          />
          {line && (
            <Scatter
              name="Reta de regressão"
              data={lineData}
              line={{ stroke: "var(--series-2)", strokeWidth: 2 }}
              shape={() => <g />}
              legendType="line"
              fill="var(--series-2)"
              isAnimationActive={false}
            />
          )}
        </RechartsScatterChart>
      </ResponsiveContainer>
    </div>
  )
}
