"use client"

import { useToast } from "@/components/site/toast"
import { registerSchema, type RegisterInput } from "@/lib/auth/schemas"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { useAuth } from "./use-auth"

/**
 * Wiring de React Hook Form para la pantalla de registro. El submit solo llama
 * a la API si zod valida; al 200 muestra el toast y navega a la verificación.
 */
export function useRegisterForm() {
  const router = useRouter()
  const { register: registerAction, toMessage } = useAuth()
  const { showToast } = useToast()

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { username: "", email: "", password: "" }
  })

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await registerAction.mutateAsync(values)
      showToast("Cuenta creada con éxito")
      router.push(`/verify-account?email=${encodeURIComponent(values.email)}`)
    } catch (error) {
      form.setError("root", { message: toMessage(error) })
    }
  })

  return {
    ...form,
    onSubmit,
    isSubmitting: registerAction.isPending,
    error: registerAction.isError
      ? toMessage(registerAction.error)
      : form.formState.errors.root?.message
  }
}
