"use client"

import type { CreateReadingFormValues } from "@/lib/readings/schemas"
import { useController, type Control } from "react-hook-form"

/**
 * Suscribe los chips de contexto al campo `tags`, aislados del resto del
 * formulario: alternar un chip solo re-renderiza este boundary.
 */
export function useReadingContextField(
  control: Control<CreateReadingFormValues>
) {
  const { field } = useController<CreateReadingFormValues, "tags">({
    control,
    name: "tags"
  })

  const selected = field.value ?? []

  const toggleTag = (tag: string) => {
    const next = selected.includes(tag)
      ? selected.filter((selectedTag) => selectedTag !== tag)
      : [...selected, tag]
    field.onChange(next)
  }

  return { selected, toggleTag }
}
