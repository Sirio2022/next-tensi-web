import { NotificationsView } from "@/components/settings/notifications/notifications-view"
import { verifySession } from "@/lib/auth/dal"
import { getNotificationPreferencesForSession } from "@/lib/notifications/dal"
import type { Metadata } from "next"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "Notificaciones"
}

/**
 * Sección "Notificaciones" (SPEC 20). Server Component delgado: resuelve la
 * sesión y las preferencias (creando los defaults en el back) y monta la vista
 * cliente. La disponibilidad de email se deriva de la sesión.
 */
export default async function SettingsNotificationsPage() {
  const user = await verifySession()

  if (!user) {
    redirect("/login")
  }

  const preferences = await getNotificationPreferencesForSession()

  if (!preferences) {
    redirect("/login")
  }

  return (
    <NotificationsView
      preferences={preferences}
      emailAvailable={Boolean(user.email)}
    />
  )
}
