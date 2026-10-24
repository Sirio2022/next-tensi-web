"use client"

import { useToast } from "@/components/site/toast"
import { ApiError } from "@/lib/http/types"
import {
  areAppearancePreferencesEqual,
  toAppearanceValues
} from "@/lib/appearance/core/preferences"
import { appearancePreferencesSchema } from "@/lib/appearance/core/schemas"
import type {
  AppearanceFormValues,
  AppearancePreferences,
  UpdateAppearancePreferencesInput
} from "@/lib/appearance/core/types"
import { updateAppearancePreferences } from "@/lib/appearance/appearance.api"
import {
  clearAppearanceDraft,
  readAppearanceDraft,
  writeAppearanceDraft
} from "@/lib/appearance/appearance-draft"
import { writeAppearanceCookie } from "@/lib/theme/appearance-cookie"
import { useAppearanceAttributes } from "@/lib/theme/hooks/use-appearance-attributes"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { useForm, useWatch } from "react-hook-form"

export function toAppearanceErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message
  if (error instanceof Error) return error.message
  return "No se pudieron guardar las preferencias. Inténtalo de nuevo."
}

/**
 * Estado y wiring de la sección Apariencia (SPEC 22): React Hook Form + zod,
 * preview inmediato sobre `<html>`, un único `PATCH` con todos los campos,
 * toast de éxito, error raíz y escritura de la cookie espejo tras guardar.
 *
 * La preview es intencionalmente optimista: al tocar un control se aplica al
 * documento, pero la cookie solo se escribe cuando el `PATCH` responde bien.
 * Los cambios sin guardar viven en `lib/appearance/appearance-draft.ts`, así
 * que sobreviven a la navegación y solo se descartan al recargar o al guardar.
 */
export function useAppearanceForm(preferences: AppearancePreferences) {
  const router = useRouter()
  const { showToast } = useToast()
  const { mutateAsync, isPending } = useMutation({
    mutationFn: (input: UpdateAppearancePreferencesInput) =>
      updateAppearancePreferences(input)
  })

  const form = useForm<AppearanceFormValues>({
    resolver: zodResolver(appearancePreferencesSchema),
    defaultValues: preferences
  })

  // Al volver a la sección se restaura el borrador de la visita anterior. Si
  // ya coincide con lo persistido no hay nada que restaurar.
  useEffect(() => {
    const draft = readAppearanceDraft()

    if (!draft || areAppearancePreferencesEqual(draft, preferences)) {
      clearAppearanceDraft()
      return
    }

    form.reset(draft)
    // Solo en el montaje: el borrador es la foto que dejó la visita anterior.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onChange = (patch: Partial<AppearanceFormValues>) => {
    form.clearErrors("root")

    for (const key of Object.keys(patch) as Array<
      keyof AppearanceFormValues
    >) {
      form.setValue(key, patch[key] as never, {
        shouldDirty: true,
        shouldValidate: false
      })
    }
  }

  const values = useWatch({
    control: form.control
  }) as AppearanceFormValues

  // El "dirty state" compara con lo persistido: volver a los valores guardados
  // deshabilita otra vez "Guardar Cambios".
  const isDirty = !areAppearancePreferencesEqual(values, preferences)

  useEffect(() => {
    if (isDirty) {
      writeAppearanceDraft(values)
    } else {
      clearAppearanceDraft()
    }
  }, [isDirty, values])

  // Preview inmediato de los cinco valores visuales (SPEC 21).
  useAppearanceAttributes(toAppearanceValues(values))

  const onSubmit = form.handleSubmit(async (formValues) => {
    try {
      const response = await mutateAsync(formValues)
      form.reset(response.preferences)
      clearAppearanceDraft()

      try {
        writeAppearanceCookie(toAppearanceValues(response.preferences))
      } catch {
        // La cookie se reintenta al cargar el dashboard (SPEC 22).
      }

      showToast("Preferencias de apariencia actualizadas")
      router.refresh()
    } catch (error) {
      form.setError("root", { message: toAppearanceErrorMessage(error) })
    }
  })

  return {
    values,
    onChange,
    onSubmit,
    isDirty,
    isSaving: isPending || form.formState.isSubmitting,
    rootError: form.formState.errors.root?.message
  }
}
