"use client"

import { Eye, EyeOff } from "lucide-react"
import { useId, useState } from "react"
import {
  useFormContext,
  type FieldError,
  type FieldValues,
  type Path
} from "react-hook-form"

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
  autoComplete
}: Readonly<PasswordFieldProps<T>>) {
  const id = useId()
  const [visible, setVisible] = useState(false)
  const {
    register,
    formState: { errors }
  } = useFormContext<T>()

  const error = errors[name] as FieldError | undefined
  const message =
    error?.message || (error ? "Este campo no es válido" : undefined)
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
          type={visible ? "text" : "password"}
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
          aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
          className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 hover:text-white transition-colors"
        >
          {visible ? (
            <EyeOff className="size-5" />
          ) : (
            <Eye className="size-5" />
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
