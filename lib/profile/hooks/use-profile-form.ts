"use client"

import { useToast } from "@/components/site/toast"
import { useAuthContext } from "@/lib/auth/auth-context"
import type { AuthUser } from "@/lib/auth/types"
import { divideBy100, times100, toDateInputValue } from "@/lib/profile/format"
import {
  toProfileErrorMessage,
  useUpdateProfile
} from "@/lib/profile/hooks/use-update-profile"
import { profileSchema, type ProfileFormValues } from "@/lib/profile/schemas"
import type { UpdateProfileInput } from "@/lib/profile/types"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { useAvatarField } from "./use-avatar-field"

/**
 * Estado y wiring del formulario de perfil: React Hook Form + zod con
 * `defaultValues` derivados del `AuthUser` (estatura convertida a cm), la
 * mutación `PATCH /users/profile` y, al guardar, `setUser` + toast +
 * `router.refresh()` para que el header refleje el cambio sin recargar. La
 * estatura se envía de vuelta en metros.
 */
export function useProfileForm(user: AuthUser) {
  const router = useRouter()
  const { setUser } = useAuthContext()
  const { showToast } = useToast()
  const { mutateAsync, isPending } = useUpdateProfile()
  const avatar = useAvatarField(user.avatarUrl)

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: user.username,
      birthDate: toDateInputValue(user.birthDate),
      gender: user.gender ?? "",
      weight: user.weight ?? undefined,
      height: user.height !== null ? times100(user.height) : undefined,
      medications: user.medications
    }
  })

  const onSubmit = form.handleSubmit(async (values) => {
    const input: UpdateProfileInput = {
      username: values.username,
      birthDate: values.birthDate || undefined,
      gender: values.gender || undefined,
      weight: values.weight,
      height:
        values.height !== undefined ? divideBy100(values.height) : undefined,
      medications: values.medications,
      avatar: avatar.file ?? undefined
    }

    try {
      const response = await mutateAsync(input)
      setUser({ ...user, ...response.user })
      showToast("Perfil actualizado con éxito")
      router.refresh()
    } catch (error) {
      form.setError("root", { message: toProfileErrorMessage(error) })
    }
  })

  return {
    ...form,
    onSubmit,
    isSubmitting: isPending,
    rootError: form.formState.errors.root?.message,
    avatar
  }
}
