import { ComingSoonSection } from "@/components/settings/coming-soon-section"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Seguridad"
}

/** Sección "Seguridad" (SPEC 18): placeholder "Disponible próximamente". */
export default function SettingsSecurityPage() {
  return (
    <ComingSoonSection
      icon="shield"
      title="Seguridad"
      description="Contraseña y privacidad"
    />
  )
}
