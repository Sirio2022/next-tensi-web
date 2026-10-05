import type { Plan } from "@/lib/auth/types"
import type { Route } from "next"
import type { MouseEvent } from "react"

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
 * Unión discriminada por `requiresPremium`: `true` para Análisis y Reportes PDF,
 * que quedan con candado en Free. El estado de render concreto (link,
 * placeholder o locked) lo decide `getNavItemState(item, plan)`.
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
 * `analytics` ya navega a su ruta real (`/dashboard/analytics`) pero sigue
 * bloqueada para el plan Free (`requiresPremium`). `reports` aún no existe:
 * para Premium es un placeholder sin candado y para Free queda bloqueada. El
 * estado concreto de cada ítem lo resuelve `getNavItemState(item, plan)`.
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
    href: "/dashboard/analytics",
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

/**
 * Devuelve el ítem activo como el que mejor prefija el pathname (el más
 * específico), de modo que en `/dashboard/new-reading` solo se marque "Nueva
 * Lectura" y no también su ítem padre "Dashboard".
 */
export function getActiveNavId(
  pathname: string
): DashboardNavItemId | undefined {
  let activeId: DashboardNavItemId | undefined
  let activeHrefLength = -1

  for (const item of DASHBOARD_NAV_ITEMS) {
    if (item.href === "#") continue

    const matches =
      pathname === item.href || pathname.startsWith(`${item.href}/`)

    if (matches && item.href.length > activeHrefLength) {
      activeId = item.id
      activeHrefLength = item.href.length
    }
  }

  return activeId
}

/** Los enlaces aún no implementados existen como marcador, pero no navegan. */
export function preventPlaceholderNavigation(
  event: MouseEvent<HTMLAnchorElement>
): void {
  event.preventDefault()
}

/**
 * Estado de render de un ítem del sidebar según el plan: `locked` (candado que
 * lleva al banner), `placeholder` (existe pero no navega) o `link` (navega).
 */
export type DashboardNavItemState = "link" | "placeholder" | "locked"

export function getNavItemState(
  item: DashboardNavItem,
  plan: Plan
): DashboardNavItemState {
  if (item.requiresPremium && plan === "FREE") return "locked"
  if (item.href === "#") return "placeholder"
  return "link"
}
