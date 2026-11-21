"use client"

import { useState } from "react"
import { CalculatorCard } from "@/components/shared/calculator-card"
import { CalculationSteps } from "@/components/shared/calculation-steps"
import { ConfidenceLevelSelect } from "@/components/shared/confidence-level-select"
import { ResultCard } from "@/components/shared/result-card"
import { useCriticalValue } from "@/hooks/use-critical-value"
import { fmtPlain, texNum } from "@/lib/formatters"
import type { ConfidenceLevel } from "@/lib/statistics/types"

export function CriticalValueCalculator() {
  const [level, setLevel] = useState<ConfidenceLevel>(95)
  const cv = useCriticalValue(level)

  return (
    <div className="flex flex-col gap-4">
      <div className="grid items-start gap-4 lg:grid-cols-2">
        <CalculatorCard title="Parâmetros" description="Escolha o grau de confiança desejado.">
          <ConfidenceLevelSelect value={level} onChange={setLevel} />
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              <strong className="text-foreground">α (alfa)</strong> é o nível de significância: a probabilidade de o
              intervalo não conter o parâmetro. Ele é dividido igualmente entre as duas caudas da curva normal (α/2).
            </p>
            <p>
              Quanto <strong className="text-foreground">maior a confiança</strong>, maior o valor de Zα/2. Com isso, a{" "}
              <strong className="text-foreground">margem de erro aumenta</strong> (o intervalo fica mais largo) e, para manter
              a mesma margem, é necessário um <strong className="text-foreground">tamanho de amostra maior</strong>.
            </p>
          </div>
        </CalculatorCard>
        <ResultCard
          summary={`valor crítico Zα/2 para ${cv.level}% de confiança.`}
          items={[
            { label: "Grau de confiança", value: `${cv.level}%` },
            { label: "α", value: fmtPlain(cv.alpha) },
            { label: "α/2", value: fmtPlain(cv.halfAlpha) },
            { label: "Zα/2", value: fmtPlain(cv.z), highlight: true },
          ]}
          interpretation={`Com ${cv.level}% de confiança, ${fmtPlain(cv.halfAlpha * 100)}% da área fica em cada cauda da curva normal, fora do intervalo entre −${fmtPlain(cv.z)} e +${fmtPlain(cv.z)}.`}
        />
      </div>
      <CalculationSteps
        steps={[
          { title: "Fórmula", tex: String.raw`\alpha = 1 - \text{confiança}` },
          { title: "Substituição", tex: String.raw`\alpha = 1 - ${texNum(cv.confidence)} = ${texNum(cv.alpha)}` },
          { title: "Divisão entre as duas caudas", tex: String.raw`\frac{\alpha}{2} = \frac{${texNum(cv.alpha)}}{2} = ${texNum(cv.halfAlpha)}` },
          {
            title: "Valor crítico (tabela do material)",
            tex: String.raw`Z_{\alpha/2} = Z_{${texNum(cv.halfAlpha)}} = ${texNum(cv.z)}`,
          },
        ]}
      />
    </div>
  )
}
