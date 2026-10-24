"use client"

import { useFormField } from "@/lib/form/hooks/use-form-field"
import type { FieldValues, Path } from "react-hook-form"

interface FormFieldProps<T extends FieldValues> {
  name: Path<T>
  label: string
  type?: React.HTMLInputTypeAttribute
  placeholder?: string
  autoComplete?: string
  disabled?: boolean
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"]
  maxLength?: number
  /** Clases extra para el input (p. ej. `[color-scheme:dark]` en fechas). */
  className?: string
}

/**
 * Campo de formulario atado a React Hook Form: resuelve `name`, `value`, `onChange`
 * y `error` desde el contexto del formulario y muestra el mensaje de zod bajo el input.
 * Los inputs `type="number"` convierten el string del DOM a número (vacío → `undefined`).
 */
export function FormField<T extends FieldValues>({
  name,
  label,
  type = "text",
  placeholder,
  autoComplete,
  disabled,
  inputMode,
  maxLength,
  className
}: Readonly<FormFieldProps<T>>) {
  const { id, message, errorId, field } = useFormField<T>(name, {
    numeric: type === "number"
  })

  return (
    <div>
      <label
        htmlFor={id}
        className="block text-xs font-semibold text-fg-muted uppercase tracking-wider mb-2"
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        disabled={disabled}
        inputMode={inputMode}
        maxLength={maxLength}
        aria-invalid={message ? true : undefined}
        aria-describedby={message ? errorId : undefined}
        className={`w-full px-4 py-3 rounded-xl bg-card-muted border border-line-strong text-fg placeholder-fg-subtle text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all aria-invalid:border-red-500 disabled:opacity-60 ${className ?? ""}`}
        {...field}
      />
      {message ? (
        <p id={errorId} role="alert" className="mt-2 text-xs text-tone-rose">
          {message}
        </p>
      ) : null}
    </div>
  )
}
