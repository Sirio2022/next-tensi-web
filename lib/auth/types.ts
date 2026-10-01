export type Plan = 'FREE' | 'PREMIUM'

export interface AuthUser {
  id: string
  username: string
  email: string | null
  plan: Plan
}

// GET /api/auth/check-token → { user }
export interface CheckTokenResponse {
  user: AuthUser
}

// register / verify-email / resend / forgot / reset / logout
export interface MessageResponse {
  message: string
}

export { ApiError } from '@/lib/http/types'
export type { ApiErrorBody } from '@/lib/http/types'
