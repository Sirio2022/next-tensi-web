import {
  APPEARANCE_COOKIE,
  serializeAppearanceCookie,
  type AppearanceValues
} from "@/lib/theme/core/appearance"

/**
 * Cookie espejo de apariencia (SPEC 21 y SPEC 22).
 *
 * Es la única fuente que lee el script anti-FOUC antes del primer pintado, así
 * que se escribe desde la capa web (`document`) y no desde la capa portable.
 * Solo contiene los cinco valores visuales; `language` y `dateFormat` no
 * afectan al pintado y no viajan en ella.
 *
 * Atributos: `Path=/`, `SameSite=Lax`, `Max-Age` de un año y `HttpOnly` ausente
 * a propósito. `Secure` se añade solo en HTTPS para no romper el desarrollo
 * local por HTTP.
 */

const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365

function isSecureContext(): boolean {
  return (
    typeof window !== "undefined" &&
    window.location.protocol === "https:"
  )
}

export function writeAppearanceCookie(values: AppearanceValues): void {
  if (typeof document === "undefined") return

  const value = encodeURIComponent(serializeAppearanceCookie(values))
  const secure = isSecureContext() ? "; Secure" : ""

  document.cookie = `${APPEARANCE_COOKIE}=${value}; Path=/; SameSite=Lax; Max-Age=${ONE_YEAR_IN_SECONDS}${secure}`
}

export function clearAppearanceCookie(): void {
  if (typeof document === "undefined") return

  const secure = isSecureContext() ? "; Secure" : ""

  document.cookie = `${APPEARANCE_COOKIE}=; Path=/; SameSite=Lax; Max-Age=0${secure}`
}
