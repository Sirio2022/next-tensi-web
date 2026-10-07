"use client"

import { FormError } from "@/components/auth/form-error"
import { SubmitButton } from "@/components/auth/submit-button"
import { PasswordField } from "@/components/form/password-field"
import { usePasswordForm } from "@/lib/profile/hooks/use-password-form"
import { FormProvider } from "react-hook-form"

/**
 * Formulario de cambio de contraseña (actual / nueva / confirmación). Reutiliza
 * `PasswordField` y el estado vive en `usePasswordForm`.
 */
export function PasswordForm() {
  const { onSubmit, isSubmitting, rootError, ...form } = usePasswordForm()

  return (
    <FormProvider {...form}>
      <form
        onSubmit={onSubmit}
        noValidate
        aria-busy={isSubmitting}
        className="space-y-6"
      >
        <PasswordField
          name="currentPassword"
          label="Contraseña Actual"
          placeholder="••••••••"
          autoComplete="current-password"
        />
        <PasswordField
          name="newPassword"
          label="Nueva Contraseña"
          placeholder="••••••••"
          autoComplete="new-password"
        />
        <PasswordField
          name="confirmNewPassword"
          label="Confirmar Nueva Contraseña"
          placeholder="••••••••"
          autoComplete="new-password"
        />

        <FormError message={rootError} />

        <SubmitButton isSubmitting={isSubmitting}>Cambiar Contraseña</SubmitButton>
      </form>
    </FormProvider>
  )
}
