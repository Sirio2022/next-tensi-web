import { http } from "@/lib/http/http"
import type { HttpClient } from "@/lib/http/types"
import type {
  NotificationPreferencesResponse,
  UpdateNotificationPreferencesInput,
  UpdateNotificationPreferencesResponse
} from "./core/types"

/**
 * Llamadas a los endpoints de notificaciones de la API Nest (SPEC 20).
 * Reciben el `HttpClient` por parámetro (por defecto el de navegador) para que
 * la capa server-side pueda pasar un cliente con la cookie entrante reenviada.
 */

function client(httpClient?: HttpClient): HttpClient {
  return httpClient ?? http
}

export function getNotificationPreferences(httpClient?: HttpClient) {
  return client(httpClient).get<NotificationPreferencesResponse>(
    "/notifications/preferences"
  )
}

export function updateNotificationPreferences(
  input: UpdateNotificationPreferencesInput,
  httpClient?: HttpClient
) {
  return client(httpClient).patch<UpdateNotificationPreferencesResponse>(
    "/notifications/preferences",
    { body: input }
  )
}
