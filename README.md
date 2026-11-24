# Calculadora de Estatística Aplicada

Calculadora por fórmulas, com resolução passo a passo, para:

- **Valores críticos** Zα/2 (90%, 95%, 99%)
- **Intervalo de confiança** para a média e para a proporção
- **Tamanho da amostra** para a média e para a proporção
- **Correlação de Pearson** e **regressão linear simples**, com gráfico
- **Base** (aba extra, no rodapé da barra lateral): média, variância e desvio padrão (σ e s)

**Histórico:** cada conta com resultado é salva sozinha no navegador (localStorage) depois de
1,5 s sem digitar. O botão "Histórico" lista as contas, e clicar numa delas abre a calculadora
com os campos preenchidos.

Tudo roda no navegador: sem servidor, sem banco de dados e sem IA.

## Comandos

```bash
npm install      # instala as dependências (só na primeira vez)
npm run dev      # abre em http://localhost:3000 e atualiza ao salvar
npm test         # roda os testes das fórmulas
npm run lint     # procura problemas no código
npm run build    # gera o site estático na pasta out/
```

`npm start` não funciona, porque o projeto gera um site estático para o GitHub Pages.

## Como o código está organizado

O caminho de um cálculo, da tela até a fórmula:

```
Tela (components/calculators/)  →  Hook (hooks/)  →  Fórmula (lib/statistics/)
 campos de texto, cards            lê o texto,        conta pura, sem React,
 e passo a passo                   valida e avisa     testada em __tests__/
```

| Pasta | O que tem |
|---|---|
| `lib/statistics/` | As fórmulas. Um arquivo por assunto: `descriptive`, `critical-values`, `confidence-intervals`, `sample-size`, `correlation`, `regression`. |
| `lib/statistics/validation.ts` | Leitura dos números digitados (vírgula, ponto, milhar) e regras dos campos. |
| `lib/statistics/types.ts` | Formato dos dados de entrada e de saída de cada fórmula. |
| `lib/statistics/__tests__/` | Testes com os exemplos do material (um arquivo por fórmula). |
| `lib/formatters.ts` | Como os números aparecem na tela (casas decimais, %, KaTeX). |
| `lib/history.ts` | Histórico salvo no localStorage (adicionar, remover, limpar). |
| `hooks/` | Um hook por calculadora (valida, chama a fórmula, gera alertas), mais `use-history` e `use-history-recorder`. |
| `components/calculators/` | A tela de cada calculadora, mais `registry.ts` (lista de abas) e `examples.ts` (dados de exemplo). |
| `components/shared/` | Peças reutilizadas: campo numérico, card de resultado, passo a passo, tabela X/Y, gráfico. |
| `components/layout/` | Barra lateral, cabeçalho, painel do histórico e estrutura da página. |
| `components/ui/` | Componentes gerados pelo shadcn. Não precisam ser editados. |

## Onde corrigir cada coisa

| Quero mudar... | Arquivo |
|---|---|
| Uma fórmula ou o resultado de uma conta | `lib/statistics/<assunto>.ts` |
| Um valor de Z (ex.: 2,575 → 2,58) | `lib/statistics/critical-values.ts` (tabela `TABLE`) |
| Como um número digitado é lido (ex.: "2.200") | `lib/statistics/validation.ts` (`parseLocaleNumber`) |
| Uma mensagem de erro de campo | `lib/statistics/validation.ts` (`validateField`) |
| Um alerta (ex.: "use t de Student") | `hooks/use-<calculadora>.ts` |
| Os dados do botão "Usar exemplo" | `components/calculators/examples.ts` |
| Textos, campos ou passo a passo de uma calculadora | `components/calculators/<calculadora>-calculator.tsx` |
| Nome, ícone ou ordem das abas, ou esconder uma aba no rodapé (`extra: true`) | `components/calculators/registry.ts` |
| O que aparece no histórico de uma calculadora | O bloco "Histórico" no fim do arquivo da calculadora |
| Tempo de espera para salvar no histórico | `hooks/use-history-recorder.ts` (`SAVE_DELAY_MS`) |
| Limite de contas guardadas | `lib/history.ts` (`MAX_ENTRIES`) |
| Casas decimais ou formato dos números | `lib/formatters.ts` |
| Cores do tema ou do gráfico | `app/globals.css` |

Depois de mexer em uma fórmula, rode `npm test`. Se algum exemplo do material parar de bater, o teste avisa.

## Publicação (GitHub Pages)

Cada push na `main` publica o site pelo workflow `.github/workflows/nextjs.yml`.
O `next.config.ts` gera o site estático (`output: "export"`) e usa a variável `BASE_PATH`,
que o workflow preenche com o caminho do repositório (`/f-calculadora-estatistica`).
