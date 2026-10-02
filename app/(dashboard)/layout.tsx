import { redirect } from 'next/navigation'
import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import { AuthProvider } from '@/lib/auth/auth-context'
import { verifySession } from '@/lib/auth/dal'

/**
 * Layout del área autenticada. Resuelve la sesión en el server, monta el shell
 * (sidebar + header) y pasa el usuario al `AuthProvider` para que los Client
 * Components lo lean sin volver a pedirlo. Sin sesión válida, redirige a login.
 */
export default async function DashboardLayout({
  children,
}: Readonly<LayoutProps<'/'>>) {
  const user = await verifySession()

  if (!user) {
    redirect('/login')
  }

  return (
    <AuthProvider initialUser={user}>
      <DashboardShell user={user}>{children}</DashboardShell>
    </AuthProvider>
  )
}
