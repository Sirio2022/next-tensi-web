import { GeneralOverview } from "@/components/settings/general-overview"
import { verifySession } from "@/lib/auth/dal"
import type { Metadata } from "next"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "Vista General"
}

/**
 * Sección "Vista General" de Configuración (SPEC 18). Server Component delgado:
 * resuelve la sesión (`verifySession()`, memoizada) y monta la vista cliente
 * presentacional con el usuario real.
 */
export default async function SettingsGeneralPage() {
  const user = await verifySession()

  if (!user) {
    redirect("/login")
  }

  return <GeneralOverview user={user} />
}
