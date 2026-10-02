"use client"

import { FormError } from "@/components/auth/form-error"
import { SubmitButton } from "@/components/auth/submit-button"
import { FormField } from "@/components/form/form-field"
import { useForgotForm } from "@/lib/auth/hooks/use-forgot-form"
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
          <svg
            className="size-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Volver al inicio de sesión
        </Link>
      </div>
    </FormProvider>
  )
}
