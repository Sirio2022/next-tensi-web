"use client"

import { FormError } from "@/components/auth/form-error"
import type { NotificationPreferences } from "@/lib/notifications/core/types"
import { useNotificationPreferencesForm } from "@/lib/notifications/hooks/use-notification-preferences-form"
import { ChannelsCard } from "./channels-card"
import { MedicalAlertsCard } from "./medical-alerts-card"
import { NotificationsHeader } from "./notifications-header"
import { RemindersCard } from "./reminders-card"
import { ReportsCard } from "./reports-card"

interface NotificationsViewProps {
  preferences: NotificationPreferences
  emailAvailable: boolean
}

/**
 * Vista cliente de la sección Notificaciones (SPEC 20). Presentacional: el
 * estado, la validación y el PATCH viven en `useNotificationPreferencesForm`.
 */
export function NotificationsView({
  preferences,
  emailAvailable
}: Readonly<NotificationsViewProps>) {
  const {
    values,
    errors,
    onChange,
    onSubmit,
    isDirty,
    isSaving,
    rootError
  } = useNotificationPreferencesForm(preferences)

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      aria-busy={isSaving}
      className="space-y-4"
    >
      <NotificationsHeader isDirty={isDirty} isSaving={isSaving} />
      <FormError message={rootError} />

      <RemindersCard
        values={values}
        errors={errors}
        disabled={isSaving}
        onChange={onChange}
      />
      <MedicalAlertsCard
        values={values}
        disabled={isSaving}
        onChange={onChange}
      />
      <ReportsCard values={values} disabled={isSaving} onChange={onChange} />
      <ChannelsCard
        values={values}
        disabled={isSaving}
        emailAvailable={emailAvailable}
        onChange={onChange}
      />
    </form>
  )
}
