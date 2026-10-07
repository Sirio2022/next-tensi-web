"use client"

import { normalizeMedications, parseMedicationInput } from "@/lib/profile/format"
import { MEDICATION_GROUPS } from "@/lib/profile/medications"
import type { ProfileFormValues } from "@/lib/profile/schemas"
import { useId, useState, type KeyboardEvent } from "react"
import { useController, type Control } from "react-hook-form"

/**
 * Estado del selector de medicamentos: suscribe el campo `medications` del
 * formulario de perfil, separa los fármacos conocidos de los personalizados
 * ("Otros") y resuelve el alta/baja de chips y el input libre (Enter o coma).
 */
export function useMedicationPicker(control: Control<ProfileFormValues>) {
  const { field } = useController({ control, name: "medications" })
  const [inputValue, setInputValue] = useState("")
  const inputId = useId()

  const selected = field.value
  const { known, custom } = normalizeMedications(selected, MEDICATION_GROUPS)

  const toggle = (medication: string) => {
    field.onChange(
      selected.includes(medication)
        ? selected.filter((item) => item !== medication)
        : [...selected, medication]
    )
  }

  const remove = (medication: string) => {
    field.onChange(selected.filter((item) => item !== medication))
  }

  const addCustom = () => {
    const parsed = parseMedicationInput(inputValue)
    if (parsed.length === 0) return

    const next = [...selected]
    for (const medication of parsed) {
      if (!next.includes(medication)) next.push(medication)
    }

    field.onChange(next)
    setInputValue("")
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter" && event.key !== ",") return
    event.preventDefault()
    addCustom()
  }

  return {
    inputId,
    inputValue,
    setInputValue,
    groups: MEDICATION_GROUPS,
    known,
    custom,
    toggle,
    remove,
    handleKeyDown
  }
}
