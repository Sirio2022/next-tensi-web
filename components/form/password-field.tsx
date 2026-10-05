"use client"

import { usePasswordField } from "@/lib/form/hooks/use-password-field"
import { Eye, EyeOff } from "lucide-react"
import type { FieldValues, Path } from "react-hook-form"

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
  const { id, visible, toggleVisible, message, errorId, field } =
    usePasswordField<T>(name)

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
          {...field}
        />
        <button
          type="button"
          onClick={toggleVisible}
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
