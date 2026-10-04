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

/** `GET /bp-readings` — lista las lecturas del usuario según su plan. */
export function getReadings(httpClient?: HttpClient) {
  return client(httpClient).get<ReadingsResponse>("/bp-readings")
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
