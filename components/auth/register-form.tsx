"use client"

import { FormError } from "@/components/auth/form-error"
import { SubmitButton } from "@/components/auth/submit-button"
import { FormField } from "@/components/form/form-field"
import { PasswordField } from "@/components/form/password-field"
import { useRegisterForm } from "@/lib/auth/hooks/use-register-form"
import Link from "next/link"
import { FormProvider } from "react-hook-form"

/** Formulario de registro: username/email/password. Presentacional + hook. */
export function RegisterForm() {
  const { onSubmit, isSubmitting, error, ...form } = useRegisterForm()

  return (
    <FormProvider {...form}>
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <FormField
          name="username"
          label="Nombre de usuario"
          placeholder="Gloria Patricia Perez"
          autoComplete="username"
        />
        <FormField
          name="email"
          label="Correo electrónico"
          type="email"
          placeholder="gppg@tensi.com"
          autoComplete="email"
        />
        <PasswordField
          name="password"
          label="Contraseña"
          placeholder="••••••••"
          autoComplete="new-password"
        />

        <FormError message={error} />

        <SubmitButton isSubmitting={isSubmitting}>Crear cuenta</SubmitButton>
      </form>

      <div className="mt-6 text-center">
        <p className="text-xs text-slate-400">
          ¿Ya tienes cuenta?{" "}
          <Link
            href="/login"
            className="text-tensi-400 hover:text-tensi-300 font-medium transition-colors"
          >
            Inicia sesión
          </Link>
        </p>
      </div>
    </FormProvider>
  )
}
