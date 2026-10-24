import { AppearanceView } from "@/components/settings/appearance/appearance-view"
import { getAppearancePreferencesForSession } from "@/lib/appearance/dal"
import { verifySession } from "@/lib/auth/dal"
import type { Metadata } from "next"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "Apariencia"
}

/**
 * Sección "Apariencia" (SPEC 22). Server Component delgado: resuelve la sesión
 * y las preferencias (creando los defaults en el back) y monta la vista
 * cliente, que aplica la preview y guarda con un único `PATCH`.
 */
export default async function SettingsAppearancePage() {
  const user = await verifySession()

  if (!user) {
    redirect("/login")
  }

  const preferences = await getAppearancePreferencesForSession()

  if (!preferences) {
    redirect("/login")
  }

  return <AppearanceView preferences={preferences} />
}
