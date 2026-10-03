"use client"

import { FormError } from "@/components/auth/form-error"
import { SubmitButton } from "@/components/auth/submit-button"
import { CodeField } from "@/components/form/code-field"
import { FormField } from "@/components/form/form-field"
import { PasswordField } from "@/components/form/password-field"
import { useResetForm } from "@/lib/auth/hooks/use-reset-form"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { FormProvider } from "react-hook-form"

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

        <SubmitButton isSubmitting={isSubmitting}>
          Cambiar contraseña
        </SubmitButton>
      </form>

      <div className="mt-6 text-center">
        <Link
          href="/login"
          className="text-xs text-slate-400 hover:text-slate-300 transition-colors inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="size-3.5" />
          Volver al inicio de sesión
        </Link>
      </div>
    </FormProvider>
  )
}
