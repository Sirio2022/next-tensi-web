import { ComingSoonSection } from "@/components/settings/coming-soon-section"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Notificaciones"
}

/** Sección "Notificaciones" (SPEC 18): placeholder "Disponible próximamente". */
export default function SettingsNotificationsPage() {
  return (
    <ComingSoonSection
      icon="bell"
      title="Notificaciones"
      description="Alertas y recordatorios"
    />
  )
}
