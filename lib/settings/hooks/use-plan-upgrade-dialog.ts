"use client"

import { useNativeDialog } from "@/lib/ui/hooks/use-native-dialog"
import {
  useCallback,
  useRef,
  useState,
  type MouseEvent,
  type RefObject,
  type SyntheticEvent
} from "react"

export interface PlanUpgradeDialogState {
  open: boolean
  /** Botón que abre el diálogo; recibe el foco al cerrar. */
  triggerRef: RefObject<HTMLButtonElement | null>
  dialogRef: RefObject<HTMLDialogElement | null>
  openDialog: () => void
  closeDialog: () => void
  onCancel: (event: SyntheticEvent) => void
  onBackdropClick: (event: MouseEvent<HTMLDialogElement>) => void
}

/**
 * Estado del `<dialog>` nativo "próximamente" del CTA "Actualizar a Premium"
 * (SPEC 18). Envuelve `useNativeDialog` (SPEC 11: la lógica vive fuera del
 * componente) y expone el disparador para devolverle el foco al cerrar.
 */
export function usePlanUpgradeDialog(): PlanUpgradeDialogState {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement | null>(null)

  const openDialog = useCallback(() => setOpen(true), [])
  const closeDialog = useCallback(() => setOpen(false), [])

  const { dialogRef, onCancel, onBackdropClick } = useNativeDialog({
    open,
    onClose: closeDialog,
    returnFocusRef: triggerRef
  })

  return {
    open,
    triggerRef,
    dialogRef,
    openDialog,
    closeDialog,
    onCancel,
    onBackdropClick
  }
}
