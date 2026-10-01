'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { useAuth } from './use-auth'
import { resetSchema, type ResetInput } from '@/lib/auth/schemas'

interface UseResetFormOptions {
  /** Email precargado desde el query param `email`. */
  email?: string
}

/**
 * Wiring de React Hook Form para el restablecimiento de contraseña. Al 200
 * vuelve a `/login` para que el usuario entre con la nueva contraseña.
 */
export function useResetForm({ email = '' }: UseResetFormOptions = {}) {
  const router = useRouter()
  const { reset, toMessage } = useAuth()

  const form = useForm<ResetInput>({
    resolver: zodResolver(resetSchema),
    defaultValues: { email, code: '', newPassword: '' },
  })

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await reset.mutateAsync(values)
      router.push('/login')
    } catch (error) {
      form.setError('root', { message: toMessage(error) })
    }
  })

  return {
    ...form,
    onSubmit,
    isSubmitting: reset.isPending,
    error: reset.isError ? toMessage(reset.error) : form.formState.errors.root?.message,
  }
}
