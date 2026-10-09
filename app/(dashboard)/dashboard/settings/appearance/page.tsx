import { ComingSoonSection } from "@/components/settings/coming-soon-section"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Apariencia"
}

/** Sección "Apariencia" (SPEC 18): placeholder "Disponible próximamente". */
export default function SettingsAppearancePage() {
  return (
    <ComingSoonSection
      icon="palette"
      title="Apariencia"
      description="Tema y personalización"
    />
  )
}
