'use client'

import Link from 'next/link'
import { FormProvider } from 'react-hook-form'
import { FormField } from '@/components/form/form-field'
import { CodeField } from '@/components/form/code-field'
import { PasswordField } from '@/components/form/password-field'
import { SubmitButton } from '@/components/auth/submit-button'
import { FormError } from '@/components/auth/form-error'
import { useResetForm } from '@/lib/auth/hooks/use-reset-form'

interface ResetPasswordFormProps {
  /** Email precargado desde el query param `email`. */
  email?: string
}

/** Formulario de restablecimiento: email + código de 6 dígitos + nueva contraseña. */
export function ResetPasswordForm({ email }: Readonly<ResetPasswordFormProps>) {
  const { onSubmit, isSubmitting, error, ...form } = useResetForm({ email })

  return (
    <FormProvider {...form}>
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <FormField
          name="email"
          label="Correo electrónico"
          type="email"
          placeholder="admin@tensi.com"
          autoComplete="email"
        />
        <CodeField name="code" label="Código de recuperación (6 dígitos)" />
        <PasswordField
          name="newPassword"
          label="Nueva Contraseña"
          placeholder="••••••••"
          autoComplete="new-password"
        />

        <FormError message={error} />

        <SubmitButton isSubmitting={isSubmitting}>Cambiar contraseña</SubmitButton>
      </form>

      <div className="mt-6 text-center">
        <Link
          href="/login"
          className="text-xs text-slate-400 hover:text-slate-300 transition-colors inline-flex items-center gap-1.5"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver al inicio de sesión
        </Link>
      </div>
    </FormProvider>
  )
}
