"use client"

import { Button } from "@/components/ui/button"
import type { EmergencyAssessment } from "@/lib/readings/types"
import { AlertTriangle } from "lucide-react"
import { useEffect, useId, useRef } from "react"

interface EmergencyAlertDialogProps {
  assessment: EmergencyAssessment
  open: boolean
  onClose: () => void
}

/**
 * Alerta de emergencia para una lectura en crisis. Usa el `<dialog>` nativo
 * (`showModal()`), que ya aporta focus trap, cierre con Escape y `::backdrop`;
 * el `uiMessage` lo define el back. Al cerrar, restauramos el foco al elemento
 * que estaba activo antes de abrir (el submit del formulario).
 */
export function EmergencyAlertDialog({
  assessment,
  open,
  onClose
}: Readonly<EmergencyAlertDialogProps>) {
  const titleId = useId()
  const bodyId = useId()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const previouslyFocused = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog || !open) return

    previouslyFocused.current = document.activeElement as HTMLElement | null
    if (!dialog.open) dialog.showModal()

    return () => {
      if (dialog.open) dialog.close()
      previouslyFocused.current?.focus()
    }
  }, [open])

  if (!open) return null

  const { title, body, primaryButtonText } = assessment.uiMessage

  return (
    <dialog
      ref={dialogRef}
      role="alertdialog"
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      aria-labelledby={titleId}
      aria-describedby={bodyId}
      className="m-0 flex size-full max-h-none max-w-none items-center justify-center border-0 bg-transparent p-4 backdrop:bg-black/75 backdrop:backdrop-blur-sm"
    >
      <div className="w-full max-w-md rounded-2xl border border-rose-500/40 bg-slate-900 p-6 shadow-2xl">
        <div className="flex items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-rose-500/15 text-rose-400">
            <AlertTriangle className="size-5" aria-hidden />
          </span>
          <h2 id={titleId} className="text-lg font-bold text-white">
            {title}
          </h2>
        </div>

        <p id={bodyId} className="mt-4 text-sm/relaxed text-slate-300">
          {body}
        </p>

        <div className="mt-6 flex justify-end">
          <Button type="button" onClick={onClose} autoFocus>
            {primaryButtonText}
          </Button>
        </div>
      </div>
    </dialog>
  )
}
