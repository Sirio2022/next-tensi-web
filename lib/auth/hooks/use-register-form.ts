'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { useAuth } from './use-auth'
import { registerSchema, type RegisterInput } from '@/lib/auth/schemas'

/**
 * Wiring de React Hook Form para la pantalla de registro. El submit solo llama
 * a la API si zod valida; al 200 navega a la verificación con el email.
 */
export function useRegisterForm() {
  const router = useRouter()
  const { register: registerAction, toMessage } = useAuth()

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { username: '', email: '', password: '' },
  })

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await registerAction.mutateAsync(values)
      router.push(`/verify-account?email=${encodeURIComponent(values.email)}`)
    } catch (error) {
      form.setError('root', { message: toMessage(error) })
    }
  })

  return {
    ...form,
    onSubmit,
    isSubmitting: registerAction.isPending,
    error: registerAction.isError ? toMessage(registerAction.error) : form.formState.errors.root?.message,
  }
}
