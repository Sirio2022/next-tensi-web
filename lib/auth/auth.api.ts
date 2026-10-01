import { http } from '@/lib/http/http'
import type { HttpClient } from '@/lib/http/types'
import type { ForgotInput, LoginInput, RegisterInput, ResetInput, VerifyInput } from './schemas'
import type { CheckTokenResponse, MessageResponse } from './types'

/**
 * Llamadas a los endpoints de auth de la API Nest. Reciben el `HttpClient`
 * por parámetro (por defecto el de navegador) para que la capa server-side
 * pueda pasar `httpServer` con la cookie reenviada.
 */

function client(httpClient?: HttpClient): HttpClient {
  return httpClient ?? http
}

export function register(input: RegisterInput, httpClient?: HttpClient) {
  return client(httpClient).post<MessageResponse>('/auth/register', { body: input })
}

export function verifyEmail(input: VerifyInput, httpClient?: HttpClient) {
  return client(httpClient).post<MessageResponse>('/auth/verify-email', { body: input })
}

export function resendVerificationCode(email: string, httpClient?: HttpClient) {
  return client(httpClient).post<MessageResponse>('/auth/resend-verification-code', {
    body: { email },
  })
}

export function login(input: LoginInput, httpClient?: HttpClient) {
  return client(httpClient).post<MessageResponse>('/auth/login', { body: input })
}

export function logout(httpClient?: HttpClient) {
  return client(httpClient).post<MessageResponse>('/auth/logout')
}

export function checkToken(httpClient?: HttpClient) {
  return client(httpClient).get<CheckTokenResponse>('/auth/check-token')
}

export function forgotPassword(input: ForgotInput, httpClient?: HttpClient) {
  return client(httpClient).post<MessageResponse>('/auth/forgot-password', { body: input })
}

export function resetPassword(input: ResetInput, httpClient?: HttpClient) {
  return client(httpClient).post<MessageResponse>('/auth/reset-password', { body: input })
}
