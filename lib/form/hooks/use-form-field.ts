"use client"

import { useId } from "react"
import {
  useFormContext,
  type FieldError,
  type FieldValues,
  type Path
} from "react-hook-form"

export interface FormFieldOptions {
  /**
   * Convierte el valor del DOM (string) a número, tratando el vacío como
   * `undefined`. Necesario para inputs `type="number"` opcionales, que RHF
   * entrega como string.
   */
  numeric?: boolean
}

/**
 * Resuelve `id`, error y props de registro de un campo atado a React Hook Form.
 * El mensaje cae a un texto por defecto cuando zod no provee uno.
 */
export function useFormField<T extends FieldValues>(
  name: Path<T>,
  options?: FormFieldOptions
) {
  const id = useId()
  const {
    register,
    formState: { errors }
  } = useFormContext<T>()

  const error = errors[name] as FieldError | undefined
  const message =
    error?.message || (error ? "Este campo no es válido" : undefined)

  const registerOptions = options?.numeric
    ? {
        setValueAs: (value: unknown) =>
          value === "" || value === null || value === undefined
            ? undefined
            : Number(value)
      }
    : undefined

  return {
    id,
    message,
    errorId: `${id}-error`,
    field: register(name, registerOptions)
  }
}
