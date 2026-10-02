import type { ReactNode } from 'react'
import type { AuthUser } from '@/lib/auth/types'
import { DashboardHeader } from './dashboard-header'
import { DashboardSidebar } from './dashboard-sidebar'

interface DashboardShellProps {
  user: AuthUser
  children: ReactNode
}

/**
 * Shell del área autenticada: sidebar + columna de contenido (header + main).
 * En móvil las columnas se apilan; desde `md` el sidebar fijo de `w-64` queda a
 * la izquierda. `children` es la página hermana que herede este layout.
 */
export function DashboardShell({
  user,
  children,
}: Readonly<DashboardShellProps>) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-slate-950 text-slate-100 antialiased md:flex-row">
      <div
        className="pointer-events-none fixed top-0 left-1/3 z-0 h-75 w-150 bg-linear-to-b from-tensi-600/10 via-indigo-600/5 to-transparent blur-3xl"
        aria-hidden="true"
      />

      <DashboardSidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardHeader user={user} />
        <main className="flex-1 space-y-8 overflow-y-auto p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
