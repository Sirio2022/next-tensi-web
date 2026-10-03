"use client"

import { FormError } from "@/components/auth/form-error"
import { SubmitButton } from "@/components/auth/submit-button"
import { CodeField } from "@/components/form/code-field"
import { FormField } from "@/components/form/form-field"
import { useVerifyForm } from "@/lib/auth/hooks/use-verify-form"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { FormProvider } from "react-hook-form"

interface VerifyAccountFormProps {
  /** Email precargado desde el query param `email`. */
  email?: string
}

/** Formulario de verificación de cuenta: email + código de 6 dígitos. */
export function VerifyAccountForm({ email }: Readonly<VerifyAccountFormProps>) {
  const {
    onSubmit,
    onResend,
    isSubmitting,
    isResending,
    error,
    notice,
    ...form
  } = useVerifyForm({
    email
  })

  return (
    <FormProvider {...form}>
      <form onSubmit={onSubmit} noValidate className="space-y-5">
        <FormField
          name="email"
          label="Correo electrónico"
          type="email"
          placeholder="gppg@tensi.com"
          autoComplete="email"
        />
        <CodeField name="code" label="Código de verificación (6 dígitos)" />

        <FormError message={error} />

        <SubmitButton isSubmitting={isSubmitting}>
          Verificar Cuenta
        </SubmitButton>
      </form>

      <div className="mt-6 text-center space-y-2">
        <p className="text-xs text-slate-400">
          ¿No recibiste el código?{" "}
          <button
            type="button"
            onClick={onResend}
            disabled={isResending}
            aria-busy={isResending}
            className="text-tensi-400 hover:text-tensi-300 font-medium transition-colors disabled:opacity-60"
          >
            {isResending ? "Reenviando…" : "Reenviar código"}
          </button>
        </p>

        {notice ? (
          <output aria-live="polite" className="block text-xs text-emerald-400">
            {notice}
          </output>
        ) : null}

        <p>
          <Link
            href="/login"
            className="text-xs text-slate-400 hover:text-slate-300 transition-colors inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="size-3.5" />
            Volver al inicio de sesión
          </Link>
        </p>
      </div>
    </FormProvider>
  )
}
