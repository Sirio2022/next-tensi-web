"use client"

import {
  useToasts,
  type ToastContextValue
} from "@/lib/site/hooks/use-toasts"
import { useToastItem } from "@/lib/ui/hooks/use-toast-item"
import { CircleCheck, X } from "lucide-react"
import { createContext, useContext, type ReactNode } from "react"

const ToastContext = createContext<ToastContextValue | null>(null)

/** Acceso al sistema de toasts desde cualquier cliente. */
export function useToast(): ToastContextValue {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast debe usarse dentro de un ToastProvider")
  }
  return context
}

/**
 * Toast individual. El auto-descarte (pausable con `hover`/`focus`) vive en
 * `useToastItem`, cuyo cleanup cancela el timer al desmontarse.
 */
function Toast({
  id,
  message,
  onDismiss
}: Readonly<{
  id: number
  message: string
  onDismiss: (id: number) => void
}>) {
  const { pause, resume } = useToastItem(id, onDismiss)

  return (
    <div
      onMouseEnter={pause}
      onMouseLeave={resume}
      onFocus={pause}
      onBlur={resume}
      className="pointer-events-auto flex items-center space-x-2 rounded-xl border border-tensi-500/40 bg-slate-900 px-4 py-3 text-xs text-white shadow-xl animate-toast-in motion-reduce:animate-none"
    >
      <CircleCheck className="size-4 shrink-0 text-tensi-400" />
      <span>{message}</span>
      <button
        type="button"
        onClick={() => onDismiss(id)}
        aria-label="Cerrar notificación"
        className="ml-1 shrink-0 rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tensi-400"
      >
        <X className="size-3.5" />
      </button>
    </div>
  )
}

/**
 * Provee el feedback de la landing (toast de éxito). Se monta a nivel global
 * en `app/layout.tsx` para sobrevivir a la navegación tras un registro.
 */
export function ToastProvider({ children }: Readonly<{ children: ReactNode }>) {
  const { toasts, dismiss, value } = useToasts()

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div
        aria-live="polite"
        className="pointer-events-none fixed bottom-6 right-6 z-60 flex flex-col space-y-2"
      >
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            id={toast.id}
            message={toast.message}
            onDismiss={dismiss}
          />
        ))}
      </div>
    </ToastContext.Provider>
  )
}
