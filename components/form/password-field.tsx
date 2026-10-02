'use client'

import { useId, useState } from 'react'
import { useFormContext, type FieldError, type FieldValues, type Path } from 'react-hook-form'

interface PasswordFieldProps<T extends FieldValues> {
  name: Path<T>
  label: string
  placeholder?: string
  autoComplete?: string
}

/**
 * Campo de contraseña atado a React Hook Form, con toggle de visibilidad y
 * accesibilidad (`aria-pressed`, label en el botón, error asociado por id).
 */
export function PasswordField<T extends FieldValues>({
  name,
  label,
  placeholder,
  autoComplete,
}: Readonly<PasswordFieldProps<T>>) {
  const id = useId()
  const [visible, setVisible] = useState(false)
  const {
    register,
    formState: { errors },
  } = useFormContext<T>()

  const error = errors[name] as FieldError | undefined
  const message = error?.message || (error ? 'Este campo no es válido' : undefined)
  const errorId = `${id}-error`

  return (
    <div>
      <label
        htmlFor={id}
        className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={message ? true : undefined}
          aria-describedby={message ? errorId : undefined}
          className="w-full px-4 py-3 pr-12 rounded-xl bg-slate-950/80 border border-slate-500 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all aria-invalid:border-red-500"
          {...register(name)}
        />
        <button
          type="button"
          onClick={() => setVisible((value) => !value)}
          aria-pressed={visible}
          aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 hover:text-white transition-colors"
        >
          {visible ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
              />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          )}
        </button>
      </div>
      {message ? (
        <p id={errorId} role="alert" className="mt-2 text-xs text-red-400">
          {message}
        </p>
      ) : null}
    </div>
  )
}
