import type { AuthUser } from "@/lib/auth/types"
import Link from "next/link"
import type { ReactNode } from "react"
import { DashboardHeader } from "./dashboard-header"
import { DashboardSidebar } from "./dashboard-sidebar"

interface DashboardShellProps {
  user: AuthUser
  children: ReactNode
}

/**
 * Shell del área autenticada: sidebar + columna de contenido (header + main).
 * En móvil las columnas se apilan y scrollea el documento; desde `md` el shell
 * ocupa el viewport (`h-screen` + `overflow-hidden`), el sidebar `w-64` queda
 * fijo a la izquierda y solo scrollea el `<main>`. `children` es la página
 * hermana que hereda este layout.
 */
export function DashboardShell({
  user,
  children
}: Readonly<DashboardShellProps>) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-x-clip bg-slate-950 text-slate-100 antialiased md:h-screen md:flex-row md:overflow-hidden">
      <div
        className="pointer-events-none fixed top-0 left-1/3 z-0 h-75 w-150 bg-linear-to-b from-tensi-600/10 via-indigo-600/5 to-transparent blur-3xl"
        aria-hidden="true"
      />

      <Link
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-xl focus:bg-slate-900 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:ring-2 focus:ring-tensi-400 focus:outline-none"
      >
        Saltar al contenido
      </Link>

      <DashboardSidebar plan={user.plan} />

      <div className="flex min-w-0 flex-1 flex-col md:min-h-0">
        <DashboardHeader user={user} />
        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 space-y-8 p-6 lg:p-8 md:min-h-0 md:overflow-y-auto"
        >
          {children}
        </main>
      </div>
    </div>
  )
}
