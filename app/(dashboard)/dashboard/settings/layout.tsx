import { SettingsShell } from "@/components/settings/settings-shell"
import { verifySession } from "@/lib/auth/dal"
import type { Metadata } from "next"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "Configuración"
}

/**
 * Layout del shell de Configuración (SPEC 18). Server Component delgado: resuelve
 * la sesión con `verifySession()` (memoizada, comparte la llamada del layout
 * padre) y pasa el plan al sub-sidebar. El contenido de cada sección llega como
 * `children`.
 */
export default async function SettingsLayout({
  children
}: Readonly<LayoutProps<"/dashboard/settings">>) {
  const user = await verifySession()

  if (!user) {
    redirect("/login")
  }

  return <SettingsShell plan={user.plan}>{children}</SettingsShell>
}
