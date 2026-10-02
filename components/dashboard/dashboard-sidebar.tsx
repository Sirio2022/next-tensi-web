"use client"

import { useLogout } from "@/lib/auth/hooks/use-logout"
import {
  DASHBOARD_NAV_ITEMS,
  DASHBOARD_SETTINGS_ITEM
} from "@/lib/dashboard/nav"
import { usePathname } from "next/navigation"
import { SidebarBrand } from "./sidebar-brand"
import { SidebarNavItem } from "./sidebar-nav-item"

/** Desplaza el viewport al banner de upgrade (los ítems bloqueados apuntan ahí). */
function scrollToUpgradeBanner() {
  document
    .getElementById("upgrade")
    ?.scrollIntoView({ behavior: "smooth", block: "start" })
}

/**
 * Sidebar del área autenticada: marca, navegación principal y bloque inferior
 * (Configuración + Cerrar Sesión). El logout usa `useLogout()`, que llama a
 * `POST /api/auth/logout` y redirige a `/login` sin arrastrar el resto de
 * mutaciones de `useAuth`.
 */
export function DashboardSidebar() {
  const pathname = usePathname()
  const { logout } = useLogout()

  return (
    <aside
      aria-label="Barra lateral"
      className="relative z-20 flex w-full shrink-0 flex-col justify-between border-r border-slate-800/80 bg-slate-950/90 backdrop-blur-xl md:w-64"
    >
      <div>
        <div className="flex h-16 items-center justify-between border-b border-slate-800/60 px-6">
          <SidebarBrand />
        </div>

        <nav aria-label="Navegación principal" className="space-y-1 p-4">
          {DASHBOARD_NAV_ITEMS.map((item) => (
            <SidebarNavItem
              key={item.id}
              item={item}
              active={item.href !== "#" && pathname === item.href}
              onLockedSelect={scrollToUpgradeBanner}
            />
          ))}
        </nav>
      </div>

      <div className="space-y-1 border-t border-slate-800/60 p-4">
        <SidebarNavItem item={DASHBOARD_SETTINGS_ITEM} />

        <button
          type="button"
          onClick={() => logout.mutate()}
          disabled={logout.isPending}
          aria-busy={logout.isPending}
          className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-rose-400 transition-all hover:bg-rose-500/10 focus-visible:ring-2 focus-visible:ring-rose-400/70 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"
        >
          <svg
            className="size-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          {logout.isPending ? "Cerrando sesión…" : "Cerrar Sesión"}
        </button>
      </div>
    </aside>
  )
}
