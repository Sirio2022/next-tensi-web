import { createFetchClient } from './fetch-client'
import type { HttpClient } from './types'

/**
 * Cliente para el navegador. Depende de `fetch` y de `credentials: 'include'`
 * (configurado dentro de `createFetchClient`) para enviar la cookie httpOnly.
 */
export const http: HttpClient = createFetchClient()

/**
 * Cliente para Server Components y otros contextos server-side. `fetch` de Next
 * no reenvía automáticamente las cookies entrantes, así que quien lo use debe
 * proveer el header `Cookie` (normalmente vía `next/headers`).
 */
export const httpServer: HttpClient = createFetchClient()
