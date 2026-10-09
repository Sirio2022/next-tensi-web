"use client"

import { Button } from "@/components/ui/button"
import { Crown } from "lucide-react"
import {
  useId,
  type MouseEvent,
  type RefObject,
  type SyntheticEvent
} from "react"

interface PlanUpgradeDialogProps {
  open: boolean
  dialogRef: RefObject<HTMLDialogElement | null>
  onClose: () => void
  onCancel: (event: SyntheticEvent) => void
  onBackdropClick: (event: MouseEvent<HTMLDialogElement>) => void
}

/**
 * Modal nativo "próximamente" del CTA de upgrade (SPEC 18). Es presentacional:
 * el estado y el `<dialog>` viven en `usePlanUpgradeDialog` (SPEC 11). Cierra con
 * Escape (`onCancel`), clic en el backdrop y el botón; el foco vuelve al
 * disparador por `useNativeDialog`.
 */
export function PlanUpgradeDialog({
  open,
  dialogRef,
  onClose,
  onCancel,
  onBackdropClick
}: Readonly<PlanUpgradeDialogProps>) {
  const titleId = useId()
  const bodyId = useId()

  if (!open) return null

  return (
    <dialog
      ref={dialogRef}
      onCancel={onCancel}
      onClick={onBackdropClick}
      aria-labelledby={titleId}
      aria-describedby={bodyId}
      className="m-auto w-full max-w-md rounded-2xl border border-amber-500/30 bg-slate-900 p-6 text-slate-100 shadow-2xl backdrop:bg-black/75 backdrop:backdrop-blur-sm"
    >
      <div className="flex items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-amber-400">
          <Crown className="size-5" aria-hidden />
        </span>
        <h2 id={titleId} className="text-lg font-bold text-white">
          Próximamente
        </h2>
      </div>

      <p id={bodyId} className="mt-4 text-sm/relaxed text-slate-300">
        La pasarela de pago aún no está disponible. Estamos trabajando para que
        puedas actualizar a Tensi Premium muy pronto.
      </p>

      <div className="mt-6 flex justify-end">
        <Button onClick={onClose} autoFocus>
          Cerrar
        </Button>
      </div>
    </dialog>
  )
}
