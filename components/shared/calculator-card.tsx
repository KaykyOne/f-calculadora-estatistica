import { RotateCcw, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface CalculatorCardProps {
  title: string
  description?: string
  onExample?: () => void
  onReset?: () => void
  children: React.ReactNode
}

export function CalculatorCard({ title, description, onExample, onReset, children }: CalculatorCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
        {(onExample || onReset) && (
          <CardAction className="flex gap-2">
            {onExample && (
              <Button variant="outline" size="sm" onClick={onExample}>
                <Sparkles /> Usar exemplo
              </Button>
            )}
            {onReset && (
              <Button variant="ghost" size="sm" onClick={onReset}>
                <RotateCcw /> Limpar
              </Button>
            )}
          </CardAction>
        )}
      </CardHeader>
      <CardContent className="flex flex-col gap-4">{children}</CardContent>
    </Card>
  )
}
