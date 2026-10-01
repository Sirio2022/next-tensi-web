import { z } from 'zod'

/**
 * Schemas zod del flujo de auth. Son la única fuente de verdad de validación
 * del cliente y replican la política del backend (DTOs con class-validator):
 * contraseña mín. 6 con 1 mayúscula, 1 minúscula y 1 número; código de 6 dígitos.
 */

const email = z
  .string()
  .min(1, 'El correo electrónico es obligatorio')
  .pipe(z.email('Introduce un correo electrónico válido'))

const password = z
  .string()
  .min(6, 'La contraseña debe tener al menos 6 caracteres')
  .regex(/[A-Z]/, 'Debe incluir al menos una mayúscula')
  .regex(/[a-z]/, 'Debe incluir al menos una minúscula')
  .regex(/[0-9]/, 'Debe incluir al menos un número')

const code = z
  .string()
  .regex(/^\d{6}$/, 'El código debe tener exactamente 6 dígitos')

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'La contraseña es obligatoria'),
})

export const registerSchema = z.object({
  username: z.string().min(3, 'El nombre de usuario debe tener al menos 3 caracteres'),
  email,
  password,
})

export const verifySchema = z.object({
  email,
  code,
})

export const forgotSchema = z.object({
  email,
})

export const resetSchema = z.object({
  email,
  code,
  newPassword: password,
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type VerifyInput = z.infer<typeof verifySchema>
export type ForgotInput = z.infer<typeof forgotSchema>
export type ResetInput = z.infer<typeof resetSchema>
