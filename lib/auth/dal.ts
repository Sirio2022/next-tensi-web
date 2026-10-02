import { createFetchClient } from "@/lib/http/fetch-client"
import { ApiError } from "@/lib/http/types"
import { cookies } from "next/headers"
import { cache } from "react"
import "server-only"
import { checkToken } from "./auth.api"
import type { AuthUser } from "./types"

/**
 * DAL server-only del flujo de auth. `verifySession()` reenvía la cookie
 * entrante hacia la API (`check-token`) y devuelve el usuario de sesión, o
 * `null` si no hay cookie o el token no es válido.
 *
 * Memoizado con `cache()` para ejecutarse una sola vez por render pass,
 * aunque lo llamen varios componentes.
 */
export const verifySession = cache(async (): Promise<AuthUser | null> => {
  const cookieStore = await cookies()
  const cookie = cookieStore.toString()

  if (!cookie) return null

  // Cliente server-side: `fetch` de Next no propaga la cookie entrante por
  // defecto, así que se reenvía explícitamente el header `Cookie`.
  const sessionClient = createFetchClient(() => ({ Cookie: cookie }))

  try {
    const { user } = await checkToken(sessionClient)
    return user
  } catch (error) {
    if (
      error instanceof ApiError &&
      (error.status === 401 || error.status === 403)
    ) {
      return null
    }
    throw error
  }
})
