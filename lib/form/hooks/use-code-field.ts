"use client"

import {
  useEffect,
  useId,
  useRef,
  type ClipboardEvent,
  type KeyboardEvent
} from "react"
import {
  useFormContext,
  useWatch,
  type FieldError,
  type FieldValues,
  type Path
} from "react-hook-form"

export const CODE_LENGTH = 6

interface UseCodeFieldOptions<T extends FieldValues> {
  name: Path<T>
  /** Enfoca el primer dígito al montar el campo. */
  autoFocus?: boolean
}

/**
 * Estado y manejo de teclado de un código de 6 dígitos atado a React Hook Form.
 * El valor del campo es el string completo; la UI lo reparte en 6 inputs.
 */
export function useCodeField<T extends FieldValues>({
  name,
  autoFocus = false
}: UseCodeFieldOptions<T>) {
  const baseId = useId()
  const inputsRef = useRef<Array<HTMLInputElement | null>>([])
  const didAutoFocusRef = useRef(false)

  const {
    control,
    setValue,
    formState: { errors }
  } = useFormContext<T>()

  // `useWatch` aísla el re-render del campo: solo cambia cuando cambia `name`,
  // no cuando lo hace el resto del formulario (a diferencia de `watch`).
  const value = String(useWatch({ control, name }) ?? "")
  const digits = Array.from(
    { length: CODE_LENGTH },
    (_, index) => value[index] ?? ""
  )

  const error = errors[name] as FieldError | undefined
  const message =
    error?.message || (error ? "Este campo no es válido" : undefined)

  // Enfoca el primer dígito una sola vez: los inputs se re-montan al cambiar
  // su `key`, así que el atributo `autoFocus` volvería a robar el foco.
  useEffect(() => {
    if (!autoFocus || didAutoFocusRef.current) return
    didAutoFocusRef.current = true
    inputsRef.current[0]?.focus()
  }, [autoFocus])

  const commit = (next: string) => {
    setValue(name, next.slice(0, CODE_LENGTH) as never, {
      // Solo valida al completar los 6 dígitos para no marcar error antes.
      shouldValidate: next.length === CODE_LENGTH,
      shouldDirty: true
    })
  }

  const setInputRef = (index: number) => (element: HTMLInputElement | null) => {
    inputsRef.current[index] = element
  }

  const handleChange = (index: number, raw: string) => {
    const digit = raw.replace(/\D/g, "").slice(-1)
    if (!digit && raw !== "") return

    const next = digits.slice()
    next[index] = digit
    commit(next.join(""))

    if (digit && index < CODE_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (
    index: number,
    event: KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Backspace") {
      if (digits[index]) {
        const next = digits.slice()
        next[index] = ""
        commit(next.join(""))
      } else if (index > 0) {
        const next = digits.slice()
        next[index - 1] = ""
        commit(next.join(""))
        inputsRef.current[index - 1]?.focus()
      }
      event.preventDefault()
      return
    }

    if (event.key === "ArrowLeft" && index > 0) {
      inputsRef.current[index - 1]?.focus()
      event.preventDefault()
      return
    }

    if (event.key === "ArrowRight" && index < CODE_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus()
      event.preventDefault()
    }
  }

  const handlePaste = (
    index: number,
    event: ClipboardEvent<HTMLInputElement>
  ) => {
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "")
    if (!pasted) return

    event.preventDefault()
    const next = digits.slice()
    for (
      let offset = 0;
      offset < pasted.length && index + offset < CODE_LENGTH;
      offset += 1
    ) {
      next[index + offset] = pasted[offset]
    }
    commit(next.join(""))

    const focusIndex = Math.min(index + pasted.length, CODE_LENGTH - 1)
    inputsRef.current[focusIndex]?.focus()
  }

  return {
    baseId,
    digits,
    length: CODE_LENGTH,
    message,
    errorId: `${baseId}-error`,
    setInputRef,
    handleChange,
    handleKeyDown,
    handlePaste
  }
}
