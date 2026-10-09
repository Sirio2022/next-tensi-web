import { PlanOverview } from "@/components/settings/plan-overview"
import { verifySession } from "@/lib/auth/dal"
import type { Metadata } from "next"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "Mi Plan"
}

/**
 * Sección "Mi Plan" de Configuración (SPEC 18). Server Component delgado:
 * resuelve la sesión y monta la vista cliente con el plan real del usuario.
 */
export default async function SettingsPlanPage() {
  const user = await verifySession()

  if (!user) {
    redirect("/login")
  }

  return <PlanOverview user={user} />
}
