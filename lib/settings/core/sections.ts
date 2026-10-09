/**
 * Catálogo de secciones de Configuración (SPEC 18).
 *
 * Vive en la capa portable `lib/…/core/` (SPEC 17): no importa Next ni toca
 * el DOM, de modo que la futura app Expo pueda reutilizarlo. El `icon` es un id
 * estable que la vista resuelve a un icono de Lucide; aquí no se importa ningún
 * componente.
 */

export type SettingsSectionId =
  | "general"
  | "notifications"
  | "appearance"
  | "security"
  | "plan"
  | "advanced"

/**
 * `coming-soon` = sección aún no implementada (placeholder accesible);
 * `available` = sección con contenido real. Ambas son visibles para Free y
 * Premium: el gating por plan se decide dentro de cada sección (SPEC 18).
 */
export type SettingsSectionState = "available" | "coming-soon"

/** Ids de icono del sub-sidebar; la vista los mapea a iconos de Lucide. */
export type SettingsIconId =
  | "user"
  | "bell"
  | "palette"
  | "shield"
  | "crown"
  | "sliders"

export interface SettingsSection {
  id: SettingsSectionId
  label: string
  description: string
  href: string
  icon: SettingsIconId
  state: SettingsSectionState
  /** Solo "Mi Plan": resalta el ítem con la corona dorada del mockup. */
  highlighted?: boolean
}

/**
 * Las seis secciones del mockup `references/dashboard/04-profile-premium`, en
 * orden. "Vista General" vive en el índice del shell (`/dashboard/settings`);
 * el resto cuelga de su propia ruta. `href` es `string` (no `Route` de Next)
 * para no acoplar el núcleo portable al enrutador web.
 */
export const SETTINGS_SECTIONS: readonly SettingsSection[] = [
  {
    id: "general",
    label: "Vista General",
    description: "Resumen de perfil y acceso rápido",
    href: "/dashboard/settings",
    icon: "user",
    state: "available"
  },
  {
    id: "notifications",
    label: "Notificaciones",
    description: "Alertas y recordatorios",
    href: "/dashboard/settings/notifications",
    icon: "bell",
    state: "coming-soon"
  },
  {
    id: "appearance",
    label: "Apariencia",
    description: "Tema y personalización",
    href: "/dashboard/settings/appearance",
    icon: "palette",
    state: "coming-soon"
  },
  {
    id: "security",
    label: "Seguridad",
    description: "Contraseña y privacidad",
    href: "/dashboard/settings/security",
    icon: "shield",
    state: "coming-soon"
  },
  {
    id: "plan",
    label: "Mi Plan",
    description: "Gestión de suscripción",
    href: "/dashboard/settings/plan",
    icon: "crown",
    state: "available",
    highlighted: true
  },
  {
    id: "advanced",
    label: "Avanzado",
    description: "Configuraciones técnicas",
    href: "/dashboard/settings/advanced",
    icon: "sliders",
    state: "coming-soon"
  }
]

/**
 * Sección activa para un `pathname`, por el prefijo más específico (mismo
 * criterio que `getActiveNavId` del sidebar). En el editor de perfil
 * (`/dashboard/settings/profile`) gana "Vista General", que es el prefijo que
 * lo contiene. Devuelve `undefined` si el pathname no cuelga del shell.
 */
export function getActiveSettingsSectionId(
  pathname: string
): SettingsSectionId | undefined {
  let activeId: SettingsSectionId | undefined
  let activeHrefLength = -1

  for (const section of SETTINGS_SECTIONS) {
    const matches =
      pathname === section.href || pathname.startsWith(`${section.href}/`)

    if (matches && section.href.length > activeHrefLength) {
      activeId = section.id
      activeHrefLength = section.href.length
    }
  }

  return activeId
}
