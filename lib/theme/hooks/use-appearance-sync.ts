"use client"

import type { AppearanceValues } from "@/lib/theme/core/appearance"
import { applyAppearanceAttributes } from "@/lib/theme/appearance-dom"
import { writeAppearanceCookie } from "@/lib/theme/appearance-cookie"
import { useEffect } from "react"

/**
 * Sincronización de apariencia del dashboard (SPEC 22).
 *
 * Se monta solo cuando la cookie espejo falta (primer login con OAuth,
 * dispositivo nuevo o cookie caducada). Aplica los valores guardados en la base
 * de datos —evitando el flash del tema por defecto— y escribe la cookie para
 * que la siguiente carga ya los reciba del script anti-FOUC y no haya que
 * volver a consultar las preferencias para pintar.
 *
 * Si escribir la cookie falla (modo privado), la siguiente carga vuelve a
 * resolver desde la base de datos y reintenta.
 */
export function useAppearanceSync(values: AppearanceValues): void {
  const { theme, accent, contrast, motion, density } = values

  useEffect(() => {
    const resolved = { theme, accent, contrast, motion, density }

    applyAppearanceAttributes(resolved)
    writeAppearanceCookie(resolved)
  }, [theme, accent, contrast, motion, density])
}
