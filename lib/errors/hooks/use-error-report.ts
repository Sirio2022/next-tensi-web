"use client"

import { useEffect } from "react"

/**
 * Punto de enganche para reportar un error de un Error Boundary a un servicio
 * externo. Hoy solo lo registra en consola; lo comparten las tres fronteras
 * (`app/error.tsx`, `app/(dashboard)/error.tsx` y `app/global-error.tsx`).
 */
export function useErrorReport(error: Error): void {
  useEffect(() => {
    // Punto de enganche para reportar el error a un servicio externo.
    console.error(error)
  }, [error])
}
