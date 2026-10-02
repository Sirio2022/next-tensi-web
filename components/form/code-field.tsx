'use client'

import { useId, useRef, type ClipboardEvent, type KeyboardEvent } from 'react'
import { useFormContext, type FieldError, type FieldValues, type Path } from 'react-hook-form'

const LENGTH = 6

interface CodeFieldProps<T extends FieldValues> {
  name: Path<T>
  label: string
}

/**
 * Campo de código de 6 dígitos atado a React Hook Form. Se registra como un
 * único campo `name` en el formulario (el valor es el string de 6 dígitos) y se
 * renderiza como 6 inputs accesibles, con navegación por teclado y pegado.
 */
export function CodeField<T extends FieldValues>({ name, label }: Readonly<CodeFieldProps<T>>) {
  const baseId = useId()
  const inputsRef = useRef<Array<HTMLInputElement | null>>([])

  const {
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<T>()

  const value = String(watch(name) ?? '')
  const digits = Array.from({ length: LENGTH }, (_, index) => value[index] ?? '')

  const error = errors[name] as FieldError | undefined
  const message = error?.message || (error ? 'Este campo no es válido' : undefined)
  const errorId = `${baseId}-error`

  const commit = (next: string) => {
    setValue(name, next.slice(0, LENGTH) as never, {
      shouldValidate: true,
      shouldDirty: true,
    })
  }

  const handleChange = (index: number, raw: string) => {
    const digit = raw.replace(/\D/g, '').slice(-1)
    if (!digit && raw !== '') return

    const next = digits.slice()
    next[index] = digit
    commit(next.join(''))

    if (digit && index < LENGTH - 1) {
      inputsRef.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace') {
      if (digits[index]) {
        const next = digits.slice()
        next[index] = ''
        commit(next.join(''))
      } else if (index > 0) {
        const next = digits.slice()
        next[index - 1] = ''
        commit(next.join(''))
        inputsRef.current[index - 1]?.focus()
      }
      event.preventDefault()
      return
    }

    if (event.key === 'ArrowLeft' && index > 0) {
      inputsRef.current[index - 1]?.focus()
      event.preventDefault()
      return
    }

    if (event.key === 'ArrowRight' && index < LENGTH - 1) {
      inputsRef.current[index + 1]?.focus()
      event.preventDefault()
    }
  }

  const handlePaste = (index: number, event: ClipboardEvent<HTMLInputElement>) => {
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '')
    if (!pasted) return

    event.preventDefault()
    const next = digits.slice()
    for (let offset = 0; offset < pasted.length && index + offset < LENGTH; offset += 1) {
      next[index + offset] = pasted[offset]
    }
    commit(next.join(''))

    const focusIndex = Math.min(index + pasted.length, LENGTH - 1)
    inputsRef.current[focusIndex]?.focus()
  }

  return (
    <fieldset className="min-w-0 w-full">
      <legend className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3 text-center">
        {label}
      </legend>
      <div className="flex gap-2">
        {digits.map((digit, index) => (
          <input
            // El índice es estable: siempre hay 6 posiciones fijas.
            key={index}
            ref={(element) => {
              inputsRef.current[index] = element
            }}
            id={`${baseId}-${index}`}
            type="text"
            inputMode="numeric"
            autoComplete={index === 0 ? 'one-time-code' : 'off'}
            maxLength={1}
            value={digit}
            onChange={(event) => handleChange(index, event.target.value)}
            onKeyDown={(event) => handleKeyDown(index, event)}
            onPaste={(event) => handlePaste(index, event)}
            aria-label={`Dígito ${index + 1} de ${LENGTH}`}
            aria-invalid={message ? true : undefined}
            aria-describedby={message ? errorId : undefined}
            className="min-w-0 flex-1 basis-0 h-12 text-center text-lg font-bold rounded-xl bg-slate-950/80 border border-slate-500 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all aria-invalid:border-red-500"
          />
        ))}
      </div>
      {message ? (
        <p id={errorId} role="alert" className="mt-3 text-xs text-red-400 text-center">
          {message}
        </p>
      ) : null}
    </fieldset>
  )
}
