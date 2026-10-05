"use client"

import { useId, useState } from "react"
import {
  useFormContext,
  type FieldError,
  type FieldValues,
  type Path
} from "react-hook-form"

/**
 * Estado de un campo de contraseña atado a React Hook Form: visibilidad del
 * texto, registro y error asociado por id.
 */
export function usePasswordField<T extends FieldValues>(name: Path<T>) {
  const id = useId()
  const [visible, setVisible] = useState(false)
  const {
    register,
    formState: { errors }
  } = useFormContext<T>()

  const error = errors[name] as FieldError | undefined
  const message =
    error?.message || (error ? "Este campo no es válido" : undefined)

  return {
    id,
    visible,
    toggleVisible: () => setVisible((value) => !value),
    message,
    errorId: `${id}-error`,
    field: register(name)
  }
}
