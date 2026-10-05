"use client"

import { useCodeField } from "@/lib/form/hooks/use-code-field"
import type { FieldValues, Path } from "react-hook-form"

interface CodeFieldProps<T extends FieldValues> {
  name: Path<T>
  label: string
  /** Deshabilita los 6 inputs (p. ej. durante el submit). */
  disabled?: boolean
  /** Enfoca el primer dígito al montar el campo. */
  autoFocus?: boolean
}

/**
 * Campo de código de 6 dígitos atado a React Hook Form. Se registra como un
 * único campo `name` en el formulario (el valor es el string de 6 dígitos) y se
 * renderiza como 6 inputs accesibles, con navegación por teclado y pegado.
 */
export function CodeField<T extends FieldValues>({
  name,
  label,
  disabled = false,
  autoFocus = false
}: Readonly<CodeFieldProps<T>>) {
  const {
    baseId,
    digits,
    length,
    message,
    errorId,
    setInputRef,
    handleChange,
    handleKeyDown,
    handlePaste
  } = useCodeField<T>({ name, autoFocus })

  return (
    <fieldset className="min-w-0 w-full">
      <legend className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3 text-center">
        {label}
      </legend>
      <div className="flex gap-2">
        {digits.map((digit, index) => (
          <input
            // El índice es estable: siempre hay 6 posiciones fijas.
            key={index + (digit || "")}
            ref={setInputRef(index)}
            id={`${baseId}-${index}`}
            type="text"
            inputMode="numeric"
            autoComplete={index === 0 ? "one-time-code" : "off"}
            maxLength={1}
            disabled={disabled}
            value={digit}
            onChange={(event) => handleChange(index, event.target.value)}
            onKeyDown={(event) => handleKeyDown(index, event)}
            onPaste={(event) => handlePaste(index, event)}
            aria-label={`Dígito ${index + 1} de ${length}`}
            aria-invalid={message ? true : undefined}
            aria-describedby={message ? errorId : undefined}
            className="min-w-0 flex-1 basis-0 h-12 text-center text-lg font-bold rounded-xl bg-slate-950/80 border border-slate-500 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all aria-invalid:border-red-500 disabled:cursor-not-allowed disabled:opacity-60"
          />
        ))}
      </div>
      {message ? (
        <p
          id={errorId}
          role="alert"
          className="mt-3 text-xs text-red-400 text-center"
        >
          {message}
        </p>
      ) : null}
    </fieldset>
  )
}
