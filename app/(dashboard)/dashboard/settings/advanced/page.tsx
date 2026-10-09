import { ComingSoonSection } from "@/components/settings/coming-soon-section"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Avanzado"
}

/** Sección "Avanzado" (SPEC 18): placeholder "Disponible próximamente". */
export default function SettingsAdvancedPage() {
  return (
    <ComingSoonSection
      icon="sliders"
      title="Avanzado"
      description="Configuraciones técnicas"
    />
  )
}
