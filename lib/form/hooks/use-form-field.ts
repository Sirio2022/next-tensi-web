"use client"

import { useId } from "react"
import {
  useFormContext,
  type FieldError,
  type FieldValues,
  type Path
} from "react-hook-form"

/**
 * Resuelve `id`, error y props de registro de un campo atado a React Hook Form.
 * El mensaje cae a un texto por defecto cuando zod no provee uno.
 */
export function useFormField<T extends FieldValues>(name: Path<T>) {
  const id = useId()
  const {
    register,
    formState: { errors }
  } = useFormContext<T>()

  const error = errors[name] as FieldError | undefined
  const message =
    error?.message || (error ? "Este campo no es válido" : undefined)

  return {
    id,
    message,
    errorId: `${id}-error`,
    field: register(name)
  }
}
