import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { AuthProvider } from "@/lib/auth/auth-context"
import { verifySession } from "@/lib/auth/dal"
import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { Suspense, type ReactNode } from "react"

/**
 * El área autenticada no debe indexarse: es una app privada por usuario. El
 * `layout` es Server Component y su `metadata` se hereda por todo el segmento.
 */
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false
  }
}

interface AuthenticatedShellProps {
  children: ReactNode
}

/**
 * Resuelve la sesión y monta el shell con el usuario. Vive dentro de un
 * `<Suspense>` para que el layout no bloquee: mientras `verifySession()` (que
 * lee cookies) resuelve, el fallback pinta un shell sin datos. El `redirect`
 * queda pegado a los datos, no en el layout.
 */
async function AuthenticatedShell({ children }: Readonly<AuthenticatedShellProps>) {
  const user = await verifySession()

  if (!user) {
    redirect("/login")
  }

  return (
    <AuthProvider initialUser={user}>
      <DashboardShell user={user}>{children}</DashboardShell>
    </AuthProvider>
  )
}

/**
 * Layout del área autenticada. La resolución de sesión se delega a
 * `AuthenticatedShell` dentro de un `<Suspense>` con fallback, de modo que el
 * documento empieza a hacer streaming (y el skeleton de `loading.tsx` puede
 * cubrir la navegación) antes de que termine el `check-token` de la API.
 */
export default function DashboardLayout({
  children
}: Readonly<LayoutProps<"/">>) {
  return (
    <Suspense fallback={<DashboardShellSkeleton />}>
      <AuthenticatedShell>{children}</AuthenticatedShell>
    </Suspense>
  )
}

/**
 * Fallback del shell mientras se resuelve la sesión. No repite el contenido
 * (lo cubre `loading.tsx`): solo reserva el chrome del área autenticada.
 */
function DashboardShellSkeleton() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 antialiased" aria-busy="true">
      <span className="sr-only">Cargando tu sesión…</span>
    </div>
  )
}
