"use client"

import { ApiError } from "@/lib/http/types"
import { updateProfile } from "@/lib/profile/profile.api"
import type {
  UpdateProfileInput,
  UpdateProfileResponse
} from "@/lib/profile/types"
import { useMutation } from "@tanstack/react-query"

/** Mensaje legible para cualquier fallo al guardar el perfil. */
export function toProfileErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message
  if (error instanceof Error) return error.message
  return "No se pudo guardar el perfil. Inténtalo de nuevo."
}

/**
 * Mutación de cliente para actualizar el perfil (`PATCH /users/profile`).
 * Expone `data`, `error` e `isPending` de TanStack Query; la pantalla decide el
 * feedback (toast + refresco del header).
 */
export function useUpdateProfile() {
  return useMutation<UpdateProfileResponse, unknown, UpdateProfileInput>({
    mutationFn: (input) => updateProfile(input)
  })
}
