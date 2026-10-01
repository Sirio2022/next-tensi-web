'use client'

import { useId } from 'react'
import { useFormContext, type FieldError, type FieldValues, type Path } from 'react-hook-form'

interface FormFieldProps<T extends FieldValues> {
  name: Path<T>
  label: string
  type?: React.HTMLInputTypeAttribute
  placeholder?: string
  autoComplete?: string
  disabled?: boolean
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode']
  maxLength?: number
}

function errorMessage(error: FieldError | undefined): string | undefined {
  if (!error) return undefined
  return error.message || 'Este campo no es válido'
}

/**
 * Campo de formulario atado a React Hook Form: resuelve `name`, `value`, `onChange`
 * y `error` desde el contexto del formulario y muestra el mensaje de zod bajo el input.
 */
export function FormField<T extends FieldValues>({
  name,
  label,
  type = 'text',
  placeholder,
  autoComplete,
  disabled,
  inputMode,
  maxLength,
}: FormFieldProps<T>) {
  const id = useId()
  const {
    register,
    formState: { errors },
  } = useFormContext<T>()

  const message = errorMessage(errors[name] as FieldError | undefined)
  const errorId = `${id}-error`

  return (
    <div>
      <label
        htmlFor={id}
        className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2"
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
        className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-500 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all aria-invalid:border-red-500 disabled:opacity-60"
        {...register(name)}
      />
      {message ? (
        <p id={errorId} role="alert" className="mt-2 text-xs text-red-400">
          {message}
        </p>
      ) : null}
    </div>
  )
}
