import { ProfileTabs } from "@/components/profile/profile-tabs"
import { verifySession } from "@/lib/auth/dal"
import type { Metadata } from "next"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "Perfil"
}

/**
 * Editor de perfil (SPEC 14) reubicado bajo Configuración (SPEC 18). Server
 * Component: resuelve la sesión y, si llega `?tab=password` desde "Acceso
 * Rápido", abre directamente la pestaña de cambio de contraseña.
 */
export default async function SettingsProfilePage({
  searchParams
}: Readonly<PageProps<"/dashboard/settings/profile">>) {
  const user = await verifySession()

  if (!user) {
    redirect("/login")
  }

  const params = await searchParams
  const initialTab = params.tab === "password" ? "password" : "profile"

  return (
    <div className="mx-auto w-full max-w-2xl space-y-8">
      <h1 className="sr-only">Perfil</h1>
      <ProfileTabs user={user} initialTab={initialTab} />
    </div>
  )
}
