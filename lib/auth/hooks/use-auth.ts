'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import * as authApi from '@/lib/auth/auth.api'
import { useOptionalAuthContext } from '@/lib/auth/auth-context'
import type {
  ForgotInput,
  LoginInput,
  RegisterInput,
  ResetInput,
  VerifyInput,
} from '@/lib/auth/schemas'
import { ApiError } from '@/lib/http/types'
import type { MessageResponse } from '@/lib/auth/types'

/** Mensaje legible para cualquier fallo de una mutación de auth. */
function toMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message
  if (error instanceof Error) return error.message
  return 'Ha ocurrido un error inesperado'
}

/**
 * Lógica de negocio del cliente para el flujo de auth. Cada acción es una
 * mutación de TanStack Query; la navegación posterior se hace con el `router`
 * de Next y, cuando cambia la sesión, se invalida la query `['auth','session']`.
 */
export function useAuth() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const authContext = useOptionalAuthContext()

  const register = useMutation<MessageResponse, unknown, RegisterInput>({
    mutationFn: (input) => authApi.register(input),
  })

  const verify = useMutation<MessageResponse, unknown, VerifyInput>({
    mutationFn: (input) => authApi.verifyEmail(input),
  })

  const resend = useMutation<MessageResponse, unknown, string>({
    mutationFn: (email) => authApi.resendVerificationCode(email),
  })

  const login = useMutation<MessageResponse, unknown, LoginInput>({
    mutationFn: (input) => authApi.login(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['auth', 'session'] })
      router.push('/dashboard')
      router.refresh()
    },
  })

  const forgot = useMutation<MessageResponse, unknown, ForgotInput>({
    mutationFn: (input) => authApi.forgotPassword(input),
  })

  const reset = useMutation<MessageResponse, unknown, ResetInput>({
    mutationFn: (input) => authApi.resetPassword(input),
  })

  const logout = useMutation<MessageResponse, unknown, void>({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      authContext?.setUser(null)
      queryClient.clear()
      router.push('/login')
      router.refresh()
    },
  })

  return {
    register,
    verify,
    resend,
    login,
    forgot,
    reset,
    logout,
    toMessage,
    /** ¿Hay alguna mutación en curso? Útil para deshabilitar el submit. */
    isBusy:
      register.isPending ||
      verify.isPending ||
      resend.isPending ||
      login.isPending ||
      forgot.isPending ||
      reset.isPending ||
      logout.isPending,
  }
}
