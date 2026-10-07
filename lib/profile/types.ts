import type { Gender, ProfileFields } from "@/lib/auth/types"

/**
 * Contrato de datos del dominio de perfil. Es el espejo en TypeScript de los
 * endpoints `PATCH /users/profile` (multipart) y
 * `POST /users/profiles/update-password` (JSON) de la API Nest.
 */

export interface UpdateProfileInput {
  username: string
  birthDate?: string // yyyy-mm-dd
  gender?: Gender
  weight?: number // kg
  height?: number // cm (el front convierte a metros antes de enviar)
  medications?: string[]
  avatar?: File
}

export interface UpdateProfileResponse {
  message: string
  user: ProfileFields
}

export interface UpdatePasswordInput {
  currentPassword: string
  newPassword: string
  confirmNewPassword: string
}

export interface UpdatePasswordResponse {
  message: string
  user: ProfileFields
}
