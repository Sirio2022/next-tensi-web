"use client"

import { ApiError } from "@/lib/http/types"
import { updatePassword } from "@/lib/profile/profile.api"
import type {
  UpdatePasswordInput,
  UpdatePasswordResponse
} from "@/lib/profile/types"
import { useMutation } from "@tanstack/react-query"

/** Mensaje legible para cualquier fallo al cambiar la contraseña. */
export function toPasswordErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message
  if (error instanceof Error) return error.message
  return "No se pudo cambiar la contraseña. Inténtalo de nuevo."
}

/**
 * Mutación de cliente para cambiar la contraseña
 * (`POST /users/profiles/update-password`). El error 401 del back (contraseña
 * actual incorrecta) llega como `ApiError` y lo muestra el formulario.
 */
export function useUpdatePassword() {
  return useMutation<UpdatePasswordResponse, unknown, UpdatePasswordInput>({
    mutationFn: (input) => updatePassword(input)
  })
}
