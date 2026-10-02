"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from "react"

interface ToastItem {
  id: number
  message: string
}

interface ToastContextValue {
  /** Muestra un toast de éxito que se autodescarta. */
  showToast: (message: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const TOAST_DURATION_MS = 3000

/** Acceso al sistema de toasts desde cualquier cliente. */
export function useToast(): ToastContextValue {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast debe usarse dentro de un ToastProvider")
  }
  return context
}

/**
 * Provee el feedback de la landing (toast de éxito). Se monta a nivel global
 * en `app/layout.tsx` para sobrevivir a la navegación tras un registro.
 */
export function ToastProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const nextId = useRef(0)
  const timers = useRef(new Set<number>())

  // Cada toast agenda su autodescarte con un timer; hay que cancelarlos si el
  // provider se desmonta (tests, cambios de raíz) para no dejar callbacks vivos.
  useEffect(() => {
    const pending = timers.current
    return () => {
      pending.forEach((timer) => window.clearTimeout(timer))
      pending.clear()
    }
  }, [])

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback(
    (message: string) => {
      const id = nextId.current
      nextId.current += 1
      setToasts((current) => [...current, { id, message }])
      const timer = window.setTimeout(() => {
        timers.current.delete(timer)
        dismiss(id)
      }, TOAST_DURATION_MS)
      timers.current.add(timer)
    },
    [dismiss]
  )

  const value = useMemo<ToastContextValue>(() => ({ showToast }), [showToast])

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div
        aria-live="polite"
        className="pointer-events-none fixed bottom-6 right-6 z-60 flex flex-col space-y-2"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-center space-x-2 rounded-xl border border-tensi-500/40 bg-slate-900 px-4 py-3 text-xs text-white shadow-xl animate-[toast-in_0.3s_ease-out]"
          >
            <svg
              className="size-4 shrink-0 text-tensi-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
