"use client"

import {
  useCallback,
  useEffect,
  useRef,
  type MouseEvent,
  type RefObject,
  type SyntheticEvent
} from "react"

interface UseNativeDialogOptions {
  open: boolean
  onClose: () => void
  /**
   * Elemento al que devolver el foco al cerrar. Necesario cuando el disparador
   * queda `disabled` durante el cierre: al deshabilitarse, el navegador mueve el
   * foco a `body` y `document.activeElement` deja de ser útil como origen. Si se
   * omite, se usa el último elemento enfocado antes de abrir.
   */
  returnFocusRef?: RefObject<HTMLElement | null>
  /**
   * Bloquea el scroll del `body` mientras el diálogo está abierto. Por defecto
   * `true`; se puede desactivar para diálogos que no lo hacían.
   */
  lockScroll?: boolean
}

/**
 * Comportamiento compartido de un `<dialog>` nativo: apertura con `showModal()`
 * (focus trap, cierre con Escape y `::backdrop` del navegador), bloqueo del
 * scroll y restauración del foco al cerrar. `onCancel` y `onBackdropClick`
 * delegan el cierre al estado de React en vez de dejar que el DOM lo haga solo.
 */
export function useNativeDialog({
  open,
  onClose,
  returnFocusRef,
  lockScroll = true
}: Readonly<UseNativeDialogOptions>): {
  dialogRef: RefObject<HTMLDialogElement | null>
  onCancel: (event: SyntheticEvent) => void
  onBackdropClick: (event: MouseEvent<HTMLDialogElement>) => void
} {
  const dialogRef = useRef<HTMLDialogElement | null>(null)
  const previouslyFocused = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog || !open) return

    previouslyFocused.current = document.activeElement as HTMLElement | null
    // Capturamos el nodo al abrir (el disparador sigue montado): durante
    // `isPending` se deshabilita y el navegador manda el foco a `body`, así que
    // leerlo en el cleanup no sería fiable.
    const returnFocusTarget = returnFocusRef?.current ?? null
    if (!dialog.open) dialog.showModal()

    const previousOverflow = document.body.style.overflow
    if (lockScroll) document.body.style.overflow = "hidden"

    return () => {
      if (dialog.open) dialog.close()
      if (lockScroll) document.body.style.overflow = previousOverflow
      const target = returnFocusTarget ?? previouslyFocused.current
      target?.focus()
    }
  }, [open, returnFocusRef, lockScroll])

  const onCancel = useCallback(
    (event: SyntheticEvent) => {
      event.preventDefault()
      onClose()
    },
    [onClose]
  )

  const onBackdropClick = useCallback(
    (event: MouseEvent<HTMLDialogElement>) => {
      if (event.target === event.currentTarget) onClose()
    },
    [onClose]
  )

  return { dialogRef, onCancel, onBackdropClick }
}
