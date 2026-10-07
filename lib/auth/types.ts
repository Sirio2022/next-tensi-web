export type Plan = "FREE" | "PREMIUM"

export type Gender = "MALE" | "FEMALE" | "OTHER"

export type OAuthProvider = "google" | "github"

/** Campos de perfil que comparten la sesión y la respuesta de actualización. */
export interface ProfileFields {
  id: string
  username: string
  email: string | null
  plan: Plan
  birthDate: string | null // ISO; la UI lo recorta a yyyy-mm-dd
  weight: number | null // kg
  height: number | null // metros (como lo guarda el back)
  gender: Gender | null
  medications: string[]
  avatarUrl: string | null
  bio: string | null
}

export interface AuthUser extends ProfileFields {
  /** `false` cuando la cuenta no tiene contraseña local (OAuth puro). */
  hasPassword: boolean
  providers: OAuthProvider[]
}

// GET /api/auth/check-token → { user }
export interface CheckTokenResponse {
  user: AuthUser
}

// register / verify-email / resend / forgot / reset / logout
export interface MessageResponse {
  message: string
}

export type { ApiErrorBody } from "@/lib/http/types"
