"use client"

import { useToast } from "@/components/site/toast"
import { ApiError } from "@/lib/http/types"
import {
  notificationPreferencesSchema,
  type NotificationPreferencesFormValues
} from "@/lib/notifications/core/schemas"
import {
  isValidIanaTimezone
} from "@/lib/notifications/core/preferences"
import type {
  NotificationPreferences,
  UpdateNotificationPreferencesInput
} from "@/lib/notifications/core/types"
import { updateNotificationPreferences } from "@/lib/notifications/notifications.api"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useForm, useWatch } from "react-hook-form"

export function toNotificationPreferencesErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message
  if (error instanceof Error) return error.message
  return "No se pudieron guardar las preferencias. Inténtalo de nuevo."
}

/** Zona IANA del navegador; la captura vive en el hook, no en `core`. */
function getBrowserTimeZone(): string | null {
  try {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
    return timeZone && isValidIanaTimezone(timeZone) ? timeZone : null
  } catch {
    return null
  }
}

/**
 * Estado y wiring de la sección Notificaciones (SPEC 20): React Hook Form +
 * zod, detección de cambios, un único `PATCH` con todos los campos, toast de
 * éxito y error raíz. La zona horaria del navegador se captura al guardar.
 */
export function useNotificationPreferencesForm(
  preferences: NotificationPreferences
) {
  const router = useRouter()
  const { showToast } = useToast()
  const { mutateAsync, isPending } = useMutation({
    mutationFn: (input: UpdateNotificationPreferencesInput) =>
      updateNotificationPreferences(input)
  })

  const form = useForm<NotificationPreferencesFormValues>({
    resolver: zodResolver(notificationPreferencesSchema),
    defaultValues: preferences
  })

  const onChange = (patch: Partial<NotificationPreferencesFormValues>) => {
    form.clearErrors("root")

    for (const key of Object.keys(patch) as Array<
      keyof NotificationPreferencesFormValues
    >) {
      form.setValue(key, patch[key] as never, {
        shouldDirty: true,
        shouldValidate: false
      })
    }
  }

  const onSubmit = form.handleSubmit(async (values) => {
    const timezone = getBrowserTimeZone() ?? values.timezone

    const input: UpdateNotificationPreferencesInput = {
      timezone,
      remindersEnabled: values.remindersEnabled,
      reminderFrequency: values.reminderFrequency,
      reminderTime: values.reminderTime,
      medicalAlertsEnabled: values.medicalAlertsEnabled,
      alertHighEnabled: values.alertHighEnabled,
      alertLowEnabled: values.alertLowEnabled,
      alertIrregularEnabled: values.alertIrregularEnabled,
      weeklyReportEnabled: values.weeklyReportEnabled,
      monthlyReportEnabled: values.monthlyReportEnabled,
      reportByEmail: values.reportByEmail,
      reportInApp: values.reportInApp,
      channelEmail: values.channelEmail,
      channelPush: values.channelPush,
      channelInApp: values.channelInApp
    }

    // En Diario no se envían los campos de la otra frecuencia (SPEC 20).
    if (values.reminderFrequency === "TWICE_DAILY") {
      input.reminderSecondTime = values.reminderSecondTime
    }
    if (values.reminderFrequency === "WEEKLY") {
      input.reminderWeekday = values.reminderWeekday
    }

    try {
      const response = await mutateAsync(input)
      form.reset(response.preferences)
      showToast("Preferencias de notificación actualizadas")
      router.refresh()
    } catch (error) {
      form.setError("root", {
        message: toNotificationPreferencesErrorMessage(error)
      })
    }
  })

  const errors = form.formState.errors
  const values = useWatch({
    control: form.control
  }) as NotificationPreferencesFormValues

  return {
    values,
    errors: {
      reminderTime: errors.reminderTime?.message,
      reminderSecondTime: errors.reminderSecondTime?.message,
      reminderWeekday: errors.reminderWeekday?.message
    },
    onChange,
    onSubmit,
    isDirty: form.formState.isDirty,
    isSaving: isPending || form.formState.isSubmitting,
    rootError: errors.root?.message
  }
}
