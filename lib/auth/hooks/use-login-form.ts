'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { useAuth } from './use-auth'
import { loginSchema, type LoginInput } from '@/lib/auth/schemas'

/**
 * Wiring de React Hook Form para la pantalla de login. La navegación al
 * dashboard la hace `useAuth.login.onSuccess`.
 */
export function useLoginForm() {
  const router = useRouter()
  const { login, toMessage } = useAuth()

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await login.mutateAsync(values)
    } catch (error) {
      form.setError('root', { message: toMessage(error) })
    }
  })

  return {
    ...form,
    onSubmit,
    isSubmitting: login.isPending,
    error: login.isError ? toMessage(login.error) : form.formState.errors.root?.message,
    goToForgotPassword: () => router.push('/forgot-password'),
  }
}
