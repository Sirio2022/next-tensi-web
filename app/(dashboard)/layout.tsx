import { AuthProvider } from '@/lib/auth/auth-context'
import { verifySession } from '@/lib/auth/dal'

/**
 * Layout del área autenticada. Resuelve la sesión en el server y la pasa al
 * `AuthProvider` para que los Client Components la lean sin volver a pedirla.
 */
export default async function DashboardLayout({ children }: Readonly<LayoutProps<'/'>>) {
  const user = await verifySession()

  return <AuthProvider initialUser={user}>{children}</AuthProvider>
}
