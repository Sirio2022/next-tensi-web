import { createFetchClient } from "@/lib/http/fetch-client"
import { ApiError } from "@/lib/http/types"
import { APPEARANCE_COOKIE, type AppearanceValues } from "@/lib/theme/core/appearance"
import { cookies } from "next/headers"
import { cache } from "react"
import "server-only"
import { getAppearancePreferences } from "./appearance.api"
import { toAppearanceValues } from "./core/preferences"
import type { AppearancePreferences } from "./core/types"

/**
 * DAL server-only de apariencia (SPEC 22). Reenvía la cookie entrante a
 * `GET /appearance/preferences` y devuelve las preferencias, o `null` si no hay
 * cookie o la sesión no es válida (401/403).
 *
 * Memoizado con `cache()` para ejecutarse una sola vez por render pass.
 */
export const getAppearancePreferencesForSession = cache(
  async (): Promise<AppearancePreferences | null> => {
    const cookieStore = await cookies()
    const cookie = cookieStore.toString()

    if (!cookie) return null

    const sessionClient = createFetchClient(() => ({ Cookie: cookie }))

    try {
      const { preferences } = await getAppearancePreferences(sessionClient)
      return preferences
    } catch (error) {
      if (
        error instanceof ApiError &&
        (error.status === 401 || error.status === 403)
      ) {
        return null
      }
      throw error
    }
  }
)

/**
 * Preferencias visuales que el dashboard debe aplicar y persistir porque la
 * cookie espejo no está presente (primer login con OAuth, dispositivo nuevo o
 * cookie caducada). Devuelve `null` cuando la cookie ya existe —no hace falta
 * ninguna llamada extra— o cuando la resolución falla: la apariencia es
 * cosmética y nunca debe romper el render del área autenticada.
 *
 * La comprobación de la cookie vive aquí para que el layout siga siendo
 * delgado y `next/headers` no salga de la capa de datos.
 */
export async function getAppearanceValuesForSync(): Promise<AppearanceValues | null> {
  try {
    const cookieStore = await cookies()

    if (cookieStore.has(APPEARANCE_COOKIE)) return null

    const preferences = await getAppearancePreferencesForSession()

    return preferences ? toAppearanceValues(preferences) : null
  } catch {
    return null
  }
}
