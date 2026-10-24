"use client"

import type { AppearanceValues } from "@/lib/theme/core/appearance"
import { applyAppearanceAttributes } from "@/lib/theme/appearance-dom"
import { useEffect } from "react"

/**
 * Aplica las preferencias de apariencia al documento (SPEC 21).
 *
 * Delega en `applyAppearanceAttributes` (capa web) para que el login y la
 * sincronización del dashboard apliquen exactamente los mismos atributos sin
 * duplicar la lógica. Es la pieza que usa la sección Apariencia (SPEC 22) para
 * previsualizar los cambios sin recargar.
 *
 * No hace cleanup al desmontarse: la preferencia aplicada sigue siendo válida
 * al navegar (el script anti-FOUC solo corre en la carga inicial del
 * documento).
 */
export function useAppearanceAttributes(values: AppearanceValues): void {
  const { theme, accent, contrast, motion, density } = values

  useEffect(() => {
    applyAppearanceAttributes({ theme, accent, contrast, motion, density })
  }, [theme, accent, contrast, motion, density])
}
