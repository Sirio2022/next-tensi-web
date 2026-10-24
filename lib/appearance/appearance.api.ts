import { http } from "@/lib/http/http"
import type { HttpClient } from "@/lib/http/types"
import type {
  AppearancePreferencesResponse,
  UpdateAppearancePreferencesInput,
  UpdateAppearancePreferencesResponse
} from "./core/types"

/**
 * Llamadas a los endpoints de apariencia de la API Nest (SPEC 22).
 * Reciben el `HttpClient` por parámetro (por defecto el de navegador) para que
 * la capa server-side pueda pasar un cliente con la cookie entrante reenviada.
 */

function client(httpClient?: HttpClient): HttpClient {
  return httpClient ?? http
}

export function getAppearancePreferences(httpClient?: HttpClient) {
  return client(httpClient).get<AppearancePreferencesResponse>(
    "/appearance/preferences"
  )
}

export function updateAppearancePreferences(
  input: UpdateAppearancePreferencesInput,
  httpClient?: HttpClient
) {
  return client(httpClient).patch<UpdateAppearancePreferencesResponse>(
    "/appearance/preferences",
    { body: input }
  )
}
