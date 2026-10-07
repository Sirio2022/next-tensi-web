import { http } from "@/lib/http/http"
import type { HttpClient } from "@/lib/http/types"
import type {
  UpdatePasswordInput,
  UpdatePasswordResponse,
  UpdateProfileInput,
  UpdateProfileResponse
} from "./types"

/**
 * Llamadas a los endpoints de perfil de la API Nest. Reciben el `HttpClient`
 * por parámetro (por defecto el de navegador) para que la capa server-side
 * pueda pasar un cliente con la cookie entrante reenviada.
 */

function client(httpClient?: HttpClient): HttpClient {
  return httpClient ?? http
}

/**
 * `PATCH /users/profile` — actualiza el perfil. El back espera
 * `multipart/form-data` (por el avatar), así que se envían solo los campos
 * presentes y `medications` se repite una vez por valor.
 */
export function updateProfile(
  input: UpdateProfileInput,
  httpClient?: HttpClient
) {
  const formData = new FormData()

  formData.append("username", input.username)

  if (input.birthDate) formData.append("birthDate", input.birthDate)
  if (input.gender) formData.append("gender", input.gender)
  if (input.weight !== undefined) {
    formData.append("weight", String(input.weight))
  }
  if (input.height !== undefined) {
    formData.append("height", String(input.height))
  }

  for (const medication of input.medications ?? []) {
    formData.append("medications", medication)
  }

  if (input.avatar) formData.append("avatar", input.avatar)

  return client(httpClient).patch<UpdateProfileResponse>("/users/profile", {
    body: formData
  })
}

/** `POST /users/profiles/update-password` — cambia la contraseña (JSON). */
export function updatePassword(
  input: UpdatePasswordInput,
  httpClient?: HttpClient
) {
  return client(httpClient).post<UpdatePasswordResponse>(
    "/users/profiles/update-password",
    { body: input }
  )
}
