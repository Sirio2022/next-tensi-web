'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { useAuth } from './use-auth'
import { forgotSchema, type ForgotInput } from '@/lib/auth/schemas'

/**
 * Wiring de React Hook Form para la solicitud de recuperación. Al 200 navega
 * al reset preservando el email en el query param.
 */
export function useForgotForm() {
  const router = useRouter()
  const { forgot, toMessage } = useAuth()

  const form = useForm<ForgotInput>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: '' },
  })

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await forgot.mutateAsync(values)
      router.push(`/reset-password?email=${encodeURIComponent(values.email)}`)
    } catch (error) {
      form.setError('root', { message: toMessage(error) })
    }
  })

  return {
    ...form,
    onSubmit,
    isSubmitting: forgot.isPending,
    error: forgot.isError ? toMessage(forgot.error) : form.formState.errors.root?.message,
  }
}
