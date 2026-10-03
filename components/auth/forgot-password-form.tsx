"use client"

import { FormError } from "@/components/auth/form-error"
import { SubmitButton } from "@/components/auth/submit-button"
import { FormField } from "@/components/form/form-field"
import { useForgotForm } from "@/lib/auth/hooks/use-forgot-form"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { FormProvider } from "react-hook-form"

/** Formulario de solicitud de recuperación: solo email. */
export function ForgotPasswordForm() {
  const { onSubmit, isSubmitting, error, ...form } = useForgotForm()

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

        <FormError message={error} />

        <SubmitButton isSubmitting={isSubmitting}>Enviar código</SubmitButton>
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
