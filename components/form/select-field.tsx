"use client"

import { useFormField } from "@/lib/form/hooks/use-form-field"
import type { FieldValues, Path } from "react-hook-form"

export interface SelectOption {
  value: string
  label: string
}

interface SelectFieldProps<T extends FieldValues> {
  name: Path<T>
  label: string
  options: readonly SelectOption[]
  /** Opción vacía inicial (valor `""`); útil para campos opcionales. */
  placeholder?: string
  /** Clases extra para el `<select>`. */
  className?: string
}

/**
 * Select atado a React Hook Form, con el mismo tratamiento de label, error y
 * accesibilidad que `FormField`. El valor de la opción "placeholder" es `""`.
 */
export function SelectField<T extends FieldValues>({
  name,
  label,
  options,
  placeholder,
  className
}: Readonly<SelectFieldProps<T>>) {
  const { id, message, errorId, field } = useFormField<T>(name)

  return (
    <div>
      <label
        htmlFor={id}
        className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2"
      >
        {label}
      </label>
      <select
        id={id}
        aria-invalid={message ? true : undefined}
        aria-describedby={message ? errorId : undefined}
        className={`w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-500 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all aria-invalid:border-red-500 ${className ?? ""}`}
        {...field}
      >
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {message ? (
        <p id={errorId} role="alert" className="mt-2 text-xs text-red-400">
          {message}
        </p>
      ) : null}
    </div>
  )
}
