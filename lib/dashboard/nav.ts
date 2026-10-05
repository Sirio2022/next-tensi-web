import type { Route } from "next"

export type DashboardNavItemId =
  | "dashboard"
  | "new-reading"
  | "history"
  | "analytics"
  | "reports"
  | "settings"

interface DashboardNavItemBase {
  id: DashboardNavItemId
  label: string
  href: Route
}

/**
 * Unión discriminada: un ítem con `requiresPremium: true` siempre requiere
 * `onLockedSelect`, de modo que el tipo impide renderizarlo sin handler.
 */
export type DashboardNavItem =
  | (DashboardNavItemBase & { requiresPremium: true })
  | (DashboardNavItemBase & { requiresPremium?: false })

/** Ítem no bloqueado (sin Premium). */
export type FreeDashboardNavItem = DashboardNavItemBase & {
  requiresPremium?: false
}

/**
 * Navegación principal del sidebar, en el orden del mockup.
 *
 * `analytics` y `reports` aún no existen y además están bloqueadas para el plan
 * Free (`requiresPremium`): se renderizan como botón que lleva al banner de
 * upgrade. El resto navega a su ruta real.
 */
export const DASHBOARD_NAV_ITEMS: readonly Readonly<DashboardNavItem>[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    href: "/dashboard",
    requiresPremium: false
  },
  {
    id: "new-reading",
    label: "Nueva Lectura",
    href: "/dashboard/new-reading",
    requiresPremium: false
  },
  {
    id: "history",
    label: "Historial",
    href: "/dashboard/history",
    requiresPremium: false
  },
  {
    id: "analytics",
    label: "Análisis",
    href: "#",
    requiresPremium: true
  },
  {
    id: "reports",
    label: "Reportes PDF",
    href: "#",
    requiresPremium: true
  }
]

/** Ítem del bloque inferior del sidebar (junto a "Cerrar Sesión"). */
export const DASHBOARD_SETTINGS_ITEM: Readonly<FreeDashboardNavItem> = {
  id: "settings",
  label: "Configuración",
  href: "#",
  requiresPremium: false
}
