"use client"

import { useToast } from "@/components/site/toast"
import {
  toPasswordErrorMessage,
  useUpdatePassword
} from "@/lib/profile/hooks/use-update-password"
import {
  passwordChangeSchema,
  type PasswordChangeFormValues
} from "@/lib/profile/schemas"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

/**
 * Estado y wiring del formulario de cambio de contraseña: React Hook Form +
 * zod y la mutación `POST /users/profiles/update-password`. Al éxito muestra el
 * toast y limpia el formulario; con la contraseña actual incorrecta (401) el
 * error del back se muestra sin romper la pantalla.
 */
export function usePasswordForm() {
  const { showToast } = useToast()
  const { mutateAsync, isPending } = useUpdatePassword()

  const form = useForm<PasswordChangeFormValues>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: ""
    }
  })

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await mutateAsync(values)
      showToast("Contraseña actualizada con éxito")
      form.reset()
    } catch (error) {
      form.setError("root", { message: toPasswordErrorMessage(error) })
    }
  })

  return {
    ...form,
    onSubmit,
    isSubmitting: isPending,
    rootError: form.formState.errors.root?.message
  }
}
