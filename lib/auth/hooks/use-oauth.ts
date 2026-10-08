"use client"

import type { OAuthProvider } from "@/lib/auth/types"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3002/api"

/**
 * Inicia el flujo OAuth de Google/GitHub. Hace una navegación de página completa
 * al endpoint de la API (no `fetch`): la API genera el `state`, redirige al
 * proveedor y, en el callback, emite la cookie httpOnly y vuelve al front.
 */
export function useOAuth() {
  function startOAuth(provider: OAuthProvider): void {
    // El destino es el origen de la API (URL absoluta externa), no una ruta
    // interna de Next; la regla no puede determinarlo estáticamente.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.assign(`${API_URL}/auth/${provider}`)
  }

  return { startOAuth }
}
