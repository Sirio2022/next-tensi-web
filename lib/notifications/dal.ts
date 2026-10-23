import { createFetchClient } from "@/lib/http/fetch-client"
import { ApiError } from "@/lib/http/types"
import { cookies } from "next/headers"
import { cache } from "react"
import "server-only"
import { getNotificationPreferences } from "./notifications.api"
import type { NotificationPreferences } from "./core/types"

/**
 * DAL server-only de notificaciones (SPEC 20). Reenvía la cookie entrante a
 * `GET /notifications/preferences` y devuelve las preferencias, o `null` si no
 * hay cookie o la sesión no es válida (401/403).
 *
 * Memoizado con `cache()` para ejecutarse una sola vez por render pass.
 */
export const getNotificationPreferencesForSession = cache(
  async (): Promise<NotificationPreferences | null> => {
    const cookieStore = await cookies()
    const cookie = cookieStore.toString()

    if (!cookie) return null

    const sessionClient = createFetchClient(() => ({ Cookie: cookie }))

    try {
      const { preferences } = await getNotificationPreferences(sessionClient)
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
