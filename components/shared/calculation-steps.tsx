/**
 * CalculationSteps — card "Resolução passo a passo".
 * Recebe uma lista de passos; cada passo tem um título e uma fórmula (LaTeX) e/ou um texto.
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FormulaDisplay } from "./formula-display"

export interface Step {
  title: string
  /** Fórmula do passo em LaTeX (opcional). */
  tex?: string
  /** Texto explicativo (opcional). */
  text?: string
}

interface CalculationStepsProps {
  steps: Step[]
  title?: string
}

export function CalculationSteps({ steps, title = "Resolução passo a passo" }: CalculationStepsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="flex flex-col gap-3">
          {steps.map((step, i) => (
            <li key={i} className="flex gap-3">
              {/* Bolinha com o número do passo. */}
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{step.title}</p>
                {step.tex && <FormulaDisplay tex={step.tex} />}
                {step.text && <p className="text-sm text-muted-foreground">{step.text}</p>}
              </div>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  )
}
