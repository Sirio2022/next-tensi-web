import { http } from "@/lib/http/http"
import type { HttpClient } from "@/lib/http/types"
import type { CreateReadingInput, CreateReadingResponse, ReadingsResponse } from "./types"

/**
 * Llamadas a los endpoints de mediciones de la API Nest. Reciben el `HttpClient`
 * por parámetro (por defecto el de navegador) para que la capa server-side pueda
 * pasar un cliente con la cookie entrante reenviada. El back es la fuente única
 * de todos los cálculos (categoría, emergencia, cuota IA).
 */

function client(httpClient?: HttpClient): HttpClient {
  return httpClient ?? http
}

/** `GET /bp-readings` — lista paginada de lecturas según el plan del usuario. */
export function getReadings(
  query?: { skip?: number; limit?: number },
  httpClient?: HttpClient
) {
  const params = new URLSearchParams()
  if (query?.skip !== undefined) params.set("skip", String(query.skip))
  if (query?.limit !== undefined) params.set("limit", String(query.limit))

  const search = params.toString()

  return client(httpClient).get<ReadingsResponse>(
    search ? `/bp-readings?${search}` : "/bp-readings"
  )
}

/** `POST /bp-readings` — crea la lectura y devuelve emergencia + análisis IA. */
export function createReading(
  input: CreateReadingInput,
  httpClient?: HttpClient
) {
  return client(httpClient).post<CreateReadingResponse>("/bp-readings", {
    body: input
  })
}
