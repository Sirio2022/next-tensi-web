import { ProfileTabs } from "@/components/profile/profile-tabs"
import { verifySession } from "@/lib/auth/dal"
import type { Metadata } from "next"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "Perfil"
}

/**
 * Pantalla de Perfil. Server Component: resuelve la sesión (memoizada con
 * `cache()`, comparte la llamada del layout) y pasa el usuario a las pestañas
 * de Perfil / Cambiar Contraseña.
 */
export default async function ProfilePage() {
  const user = await verifySession()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-8">
      <h1 className="sr-only">Perfil</h1>
      <ProfileTabs user={user} />
    </div>
  )
}
