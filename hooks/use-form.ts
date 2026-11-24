/**
 * useForm — estado simples de formulário.
 *
 * Usado por todas as calculadoras com campos. Exemplo:
 *   const { form, set, setForm } = useForm({ n: "", sd: "" })
 *   <NumberField value={form.n} onChange={set("n")} />
 *   <Button onClick={() => setForm(EXEMPLO)}>Usar exemplo</Button>
 */

import { useState } from "react"

export function useForm<T extends object>(initial: T) {
  const [form, setForm] = useState<T>(initial)

  /** set("campo") devolve a função que atualiza só aquele campo. */
  const set =
    <K extends keyof T>(key: K) =>
    (value: T[K]) =>
      setForm((current) => ({ ...current, [key]: value }))

  return { form, set, setForm }
}
