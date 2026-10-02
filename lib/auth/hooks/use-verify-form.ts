"use client"

import { verifySchema, type VerifyInput } from "@/lib/auth/schemas"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { useAuth } from "./use-auth"

interface UseVerifyFormOptions {
  /** Email precargado desde el query param `email`. */
  email?: string
}

/**
 * Wiring de React Hook Form para la verificación de cuenta. Incluye el submit
 * del código y la acción de reenvío, que reutiliza el email del formulario.
 */
export function useVerifyForm({ email = "" }: UseVerifyFormOptions = {}) {
  const router = useRouter()
  const { verify, resend, toMessage } = useAuth()

  const form = useForm<VerifyInput>({
    resolver: zodResolver(verifySchema),
    defaultValues: { email, code: "" }
  })

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await verify.mutateAsync(values)
      router.push("/login")
    } catch (error) {
      form.setError("root", { message: toMessage(error) })
    }
  })

  const onResend = async () => {
    const emailValue = form.getValues("email")
    const valid = await form.trigger("email")
    if (!valid) return

    try {
      const result = await resend.mutateAsync(emailValue)
      form.setError("root", { type: "resend", message: result.message })
    } catch (error) {
      form.setError("root", { message: toMessage(error) })
    }
  }

  const rootError = form.formState.errors.root

  return {
    ...form,
    onSubmit,
    onResend,
    isSubmitting: verify.isPending,
    isResending: resend.isPending,
    error:
      rootError && rootError.type !== "resend"
        ? verify.isError
          ? toMessage(verify.error)
          : rootError.message
        : undefined,
    notice: rootError?.type === "resend" ? rootError.message : undefined
  }
}
