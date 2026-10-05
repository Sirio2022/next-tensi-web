"use client"

import { useLogout } from "@/lib/auth/hooks/use-logout"
import type { Plan } from "@/lib/auth/types"
import { useActiveNavId } from "@/lib/dashboard/hooks/use-active-nav-id"
import {
  DASHBOARD_NAV_ITEMS,
  DASHBOARD_SETTINGS_ITEM,
  getNavItemState
} from "@/lib/dashboard/nav"
import { scrollToUpgradeBanner } from "@/lib/dashboard/scroll-to-upgrade"
import { LogOut } from "lucide-react"
import { SidebarBrand } from "./sidebar-brand"
import { SidebarNavItem } from "./sidebar-nav-item"

interface DashboardSidebarProps {
  /** Plan del usuario: resuelve qué ítems navegan, son placeholder o van con candado. */
  plan: Plan
}

/**
 * Sidebar del área autenticada: marca, navegación principal y bloque inferior
 * (Configuración + Cerrar Sesión). El estado de cada ítem se resuelve con
 * `getNavItemState(item, plan)`: Premium navega Análisis y ve Reportes PDF como
 * placeholder, mientras que Free los mantiene con candado hacia el banner.
 * El logout usa `useLogout()`, que llama a `POST /api/auth/logout` y redirige a
 * `/login` sin arrastrar el resto de mutaciones de `useAuth`.
 */
export function DashboardSidebar({ plan }: Readonly<DashboardSidebarProps>) {
  const activeNavId = useActiveNavId()
  const { logout } = useLogout()

  return (
    <aside
      aria-label="Barra lateral"
      className="relative z-20 flex w-full shrink-0 flex-col justify-between border-r border-slate-800/80 bg-slate-950/90 backdrop-blur-xl md:h-screen md:w-64"
    >
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-800/60 px-6">
          <SidebarBrand />
        </div>

        <nav
          aria-label="Navegación principal"
          className="flex-1 space-y-1 overflow-y-auto p-4"
        >
          {DASHBOARD_NAV_ITEMS.map((item) => {
            const state = getNavItemState(item, plan)

            return state === "locked" ? (
              <SidebarNavItem
                key={item.id}
                item={item}
                state="locked"
                onLockedSelect={scrollToUpgradeBanner}
              />
            ) : (
              <SidebarNavItem
                key={item.id}
                item={item}
                state={state}
                active={activeNavId === item.id}
              />
            )
          })}
        </nav>
      </div>

      <div className="shrink-0 space-y-1 border-t border-slate-800/60 p-4">
        {/* Configuración sigue siendo un marcador (`href="#"`): placeholder. */}
        <SidebarNavItem item={DASHBOARD_SETTINGS_ITEM} state="placeholder" />

        <button
          type="button"
          onClick={() => logout.mutate()}
          disabled={logout.isPending}
          aria-busy={logout.isPending}
          className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-rose-400 transition-all hover:bg-rose-500/10 focus-visible:ring-2 focus-visible:ring-rose-400/70 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"
        >
          <LogOut className="size-5" />
          {logout.isPending ? "Cerrando sesión…" : "Cerrar Sesión"}
        </button>
      </div>
    </aside>
  )
}
