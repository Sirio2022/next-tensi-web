"use client"

import { useCallback, useMemo, useRef, useState } from "react"

export interface ToastItem {
  id: number
  message: string
}

export interface ToastContextValue {
  /** Muestra un toast de éxito que se autodescarta. */
  showToast: (message: string) => void
}

/**
 * Estado del sistema de toasts: lista viva, alta y descarte, y el `value`
 * estable que conecta el provider. El auto-descarte de cada toast vive en
 * `use-toast-item`.
 */
export function useToasts() {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const nextId = useRef(0)

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback((message: string) => {
    const id = nextId.current
    nextId.current += 1
    setToasts((current) => [...current, { id, message }])
  }, [])

  const value = useMemo<ToastContextValue>(() => ({ showToast }), [showToast])

  return { toasts, dismiss, value }
}
