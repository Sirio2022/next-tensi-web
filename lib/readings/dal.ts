import { createFetchClient } from "@/lib/http/fetch-client"
import { ApiError } from "@/lib/http/types"
import { cookies } from "next/headers"
import { cache } from "react"
import "server-only"
import { getReadings } from "./readings.api"
import type { ReadingsResponse } from "./types"

/**
 * DAL server-only de las mediciones. `getReadingsForSession()` reenvía la
 * cookie entrante hacia la API (`GET /bp-readings`) y devuelve la respuesta, o
 * `null` si no hay cookie o la sesión no es válida (401/403).
 *
 * Memoizado con `cache()` para ejecutarse una sola vez por render pass, aunque
 * lo llamen varios componentes.
 */
export const getReadingsForSession = cache(
  async (): Promise<ReadingsResponse | null> => {
    const cookieStore = await cookies()
    const cookie = cookieStore.toString()

    if (!cookie) return null

    // Cliente server-side: `fetch` de Next no propaga la cookie entrante por
    // defecto, así que se reenvía explícitamente el header `Cookie`.
    const sessionClient = createFetchClient(() => ({ Cookie: cookie }))

    try {
      return await getReadings(sessionClient)
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
