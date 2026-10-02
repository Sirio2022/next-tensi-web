export type DashboardNavItemId =
  | 'dashboard'
  | 'new-reading'
  | 'history'
  | 'analytics'
  | 'reports'
  | 'settings'

export interface DashboardNavItem {
  id: DashboardNavItemId
  label: string
  href: string
  /** La feature existe en el producto pero no para el plan Free. */
  requiresPremium: boolean
}

/**
 * Navegación principal del sidebar, en el orden del mockup.
 *
 * Salvo `dashboard`, las pantallas aún no existen: sus enlaces quedan como
 * marcadores (`#`) y no navegan (ver SPEC 03, fuera de alcance). `analytics` y
 * `reports` además están bloqueadas para el plan Free (`requiresPremium`).
 */
export const DASHBOARD_NAV_ITEMS: readonly DashboardNavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/dashboard',
    requiresPremium: false,
  },
  {
    id: 'new-reading',
    label: 'Nueva Lectura',
    href: '#',
    requiresPremium: false,
  },
  {
    id: 'history',
    label: 'Historial',
    href: '#',
    requiresPremium: false,
  },
  {
    id: 'analytics',
    label: 'Análisis',
    href: '#',
    requiresPremium: true,
  },
  {
    id: 'reports',
    label: 'Reportes PDF',
    href: '#',
    requiresPremium: true,
  },
]

/** Ítem del bloque inferior del sidebar (junto a "Cerrar Sesión"). */
export const DASHBOARD_SETTINGS_ITEM: DashboardNavItem = {
  id: 'settings',
  label: 'Configuración',
  href: '#',
  requiresPremium: false,
}
