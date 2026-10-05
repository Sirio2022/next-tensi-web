"use client"

import { ApiError } from "@/lib/http/types"
import { createReading } from "@/lib/readings/readings.api"
import type {
  CreateReadingInput,
  CreateReadingResponse
} from "@/lib/readings/types"
import { useMutation } from "@tanstack/react-query"

/** Mensaje legible para cualquier fallo al guardar una lectura. */
export function toReadingErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message
  if (error instanceof Error) return error.message
  return "No se pudo guardar la lectura. Inténtalo de nuevo."
}

/**
 * Mutación de cliente para crear una lectura (`POST /bp-readings`). Expone
 * `data`, `error` e `isPending` de TanStack Query y **no** navega: la pantalla
 * decide qué mostrar tras guardar (análisis IA + alerta de emergencia).
 */
export function useCreateReading() {
  return useMutation<CreateReadingResponse, unknown, CreateReadingInput>({
    mutationFn: (input) => createReading(input)
  })
}
