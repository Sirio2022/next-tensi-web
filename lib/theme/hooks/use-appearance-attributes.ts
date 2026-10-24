"use client"

import {
  toAppearanceAttributes,
  type AppearanceValues
} from "@/lib/theme/core/appearance"
import { useEffect } from "react"

/** Atributos que el hook sincroniza en `<html>`; el resto los decide el CSS. */
const APPEARANCE_ATTRIBUTE_NAMES = [
  "data-theme",
  "data-accent",
  "data-contrast",
  "data-motion",
  "data-density"
] as const

/**
 * Aplica las preferencias de apariencia al documento (SPEC 21).
 *
 * Escribe en `<html>` solo los atributos que difieren del default y elimina los
 * que sobran (por ejemplo al pasar a `theme: "auto"`). También ajusta
 * `color-scheme` para que scrollbars y controles nativos acompañen al tema.
 *
 * Es la pieza que usará la sección Apariencia (SPEC 22) para previsualizar los
 * cambios sin recargar. No hace cleanup al desmontarse: la preferencia aplicada
 * sigue siendo válida al navegar (el script anti-FOUC solo corre en la carga
 * inicial del documento).
 */
export function useAppearanceAttributes(values: AppearanceValues): void {
  const { theme, accent, contrast, motion, density } = values

  useEffect(() => {
    const root = document.documentElement
    const attributes = toAppearanceAttributes({
      theme,
      accent,
      contrast,
      motion,
      density
    })

    for (const name of APPEARANCE_ATTRIBUTE_NAMES) {
      const value = attributes[name]

      if (value) {
        root.setAttribute(name, value)
      } else {
        root.removeAttribute(name)
      }
    }

    if (theme === "auto") {
      root.style.removeProperty("color-scheme")
    } else {
      root.style.colorScheme = theme
    }
  }, [theme, accent, contrast, motion, density])
}
