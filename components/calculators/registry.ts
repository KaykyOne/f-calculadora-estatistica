/**
 * LISTA DE CALCULADORAS (ABAS)
 *
 * A barra lateral e o cabeçalho são montados a partir desta lista, na ordem em que
 * as calculadoras aparecem aqui.
 * ► Para mudar o nome, a descrição, o ícone ou a ordem de uma aba, altere só este arquivo.
 * ► Para criar uma calculadora nova: crie o componente em components/calculators/ e
 *   adicione um item aqui.
 * ► Itens com `extra: true` ficam escondidos no rodapé da barra lateral (ex.: aba Base,
 *   que não faz parte do material da professora).
 */

import type { ComponentType } from "react"
import { Calculator, ChartLine, ChartNoAxesColumn, ChartScatter, Percent, Ruler, Sigma, Users } from "lucide-react"
import type { CalculatorProps } from "./types"
import { DescriptiveCalculator } from "./descriptive-calculator"
import { CriticalValueCalculator } from "./critical-value-calculator"
import { MeanConfidenceCalculator } from "./mean-confidence-calculator"
import { ProportionConfidenceCalculator } from "./proportion-confidence-calculator"
import { SampleSizeMeanCalculator } from "./sample-size-mean-calculator"
import { SampleSizeProportionCalculator } from "./sample-size-proportion-calculator"
import { PearsonCalculator } from "./pearson-calculator"
import { LinearRegressionCalculator } from "./linear-regression-calculator"

export interface CalculatorEntry {
  /** Identificador único (não aparece na tela). */
  id: string
  /** Título grande no cabeçalho. */
  title: string
  /** Nome curto na barra lateral. */
  shortTitle: string
  /** Frase abaixo do título. */
  description: string
  /** Grupo da barra lateral (itens com o mesmo grupo ficam juntos). */
  group: string
  /** true = aba secundária, mostrada discretamente no rodapé da barra lateral. */
  extra?: boolean
  /** Ícone (lucide-react). */
  icon: ComponentType<{ className?: string }>
  /** Componente da calculadora. */
  component: ComponentType<CalculatorProps>
}

export const CALCULATORS: CalculatorEntry[] = [
  {
    id: "valores-criticos",
    title: "Valores críticos Zα/2",
    shortTitle: "Valores críticos",
    description: "Relação entre grau de confiança, nível de significância α e o valor crítico Zα/2.",
    group: "Fundamentos",
    icon: Sigma,
    component: CriticalValueCalculator,
  },
  {
    id: "ic-media",
    title: "Intervalo de confiança para a média",
    shortTitle: "IC para a média",
    description: "Estima a média populacional μ a partir da média amostral, do desvio padrão e do tamanho da amostra.",
    group: "Intervalos de confiança",
    icon: Calculator,
    component: MeanConfidenceCalculator,
  },
  {
    id: "ic-proporcao",
    title: "Intervalo de confiança para proporção",
    shortTitle: "IC para proporção",
    description: "Estima a proporção populacional π a partir do número de sucessos em uma amostra.",
    group: "Intervalos de confiança",
    icon: Percent,
    component: ProportionConfidenceCalculator,
  },
  {
    id: "amostra-media",
    title: "Tamanho da amostra para média",
    shortTitle: "Amostra: média",
    description: "Tamanho mínimo da amostra para estimar uma média com a margem de erro desejada.",
    group: "Tamanho da amostra",
    icon: Ruler,
    component: SampleSizeMeanCalculator,
  },
  {
    id: "amostra-proporcao",
    title: "Tamanho da amostra para proporção",
    shortTitle: "Amostra: proporção",
    description: "Tamanho mínimo da amostra para estimar uma proporção com a margem de erro desejada.",
    group: "Tamanho da amostra",
    icon: Users,
    component: SampleSizeProportionCalculator,
  },
  {
    id: "pearson",
    title: "Correlação de Pearson",
    shortTitle: "Pearson (r)",
    description: "Mede o sentido e a intensidade da relação linear entre duas variáveis X e Y.",
    group: "Correlação e regressão",
    icon: ChartScatter,
    component: PearsonCalculator,
  },
  {
    id: "regressao",
    title: "Regressão linear simples",
    shortTitle: "Regressão linear",
    description: "Ajusta a reta ŷ = ax + b pelo método dos mínimos quadrados e faz previsões.",
    group: "Correlação e regressão",
    icon: ChartLine,
    component: LinearRegressionCalculator,
  },
  {
    id: "base",
    title: "Base: média e desvio padrão",
    shortTitle: "Base (x̄, σ, s)",
    description: "Calcula a média, a variância e o desvio padrão (σ e s) de uma lista de valores, com a tabela de desvios.",
    group: "Extra",
    extra: true,
    icon: ChartNoAxesColumn,
    component: DescriptiveCalculator,
  },
]

/** Aba aberta ao carregar a página: a primeira que não é extra. */
export const DEFAULT_CALCULATOR_ID = CALCULATORS.find((c) => !c.extra)?.id ?? CALCULATORS[0].id
