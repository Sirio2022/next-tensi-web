import {
  toAppearanceAttributes,
  type AppearanceValues
} from "@/lib/theme/core/appearance"

/**
 * Aplicación imperativa de la apariencia sobre `<html>` (SPEC 21 y SPEC 22).
 *
 * Es la versión "fuera de React" de lo que hace `useAppearanceAttributes`: la
 * usan los flujos que no pueden montar un hook en ese momento (login con
 * email/contraseña) y la sincronización del dashboard. Vive en la capa web
 * porque toca `document`; el núcleo portable solo calcula los atributos.
 */

/** Atributos que se sincronizan en `<html>`; el resto los decide el CSS. */
const APPEARANCE_ATTRIBUTE_NAMES = [
  "data-theme",
  "data-accent",
  "data-contrast",
  "data-motion",
  "data-density"
] as const

/**
 * Escribe en `<html>` solo los atributos que difieren del default y elimina los
 * que sobran (por ejemplo al pasar a `theme: "auto"`). También ajusta
 * `color-scheme` para que scrollbars y controles nativos acompañen al tema.
 */
export function applyAppearanceAttributes(values: AppearanceValues): void {
  if (typeof document === "undefined") return

  const root = document.documentElement
  const attributes = toAppearanceAttributes(values)

  for (const name of APPEARANCE_ATTRIBUTE_NAMES) {
    const value = attributes[name]

    if (value) {
      root.setAttribute(name, value)
    } else {
      root.removeAttribute(name)
    }
  }

  if (values.theme === "auto") {
    root.style.removeProperty("color-scheme")
  } else {
    root.style.colorScheme = values.theme
  }
}

/**
 * Devuelve `<html>` a su estado sin preferencias: sin atributos, de modo que el
 * CSS decida con `prefers-color-scheme` (SPEC 21). Se usa al cerrar sesión para
 * que el siguiente usuario del dispositivo no herede el tema del anterior
 * (SPEC 22).
 */
export function resetAppearanceAttributes(): void {
  if (typeof document === "undefined") return

  const root = document.documentElement

  for (const name of APPEARANCE_ATTRIBUTE_NAMES) {
    root.removeAttribute(name)
  }

  root.style.removeProperty("color-scheme")
}
