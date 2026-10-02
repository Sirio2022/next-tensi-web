import { createFetchClient } from './fetch-client'
import type { HttpClient } from './types'

/**
 * Cliente para el navegador. Depende de `fetch` y de `credentials: 'include'`
 * (configurado dentro de `createFetchClient`) para enviar la cookie httpOnly.
 */
export const http: HttpClient = createFetchClient()
