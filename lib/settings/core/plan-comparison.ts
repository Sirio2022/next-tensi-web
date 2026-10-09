/**
 * Comparativa Free vs Premium de la sección "Mi Plan" (SPEC 18).
 *
 * Vive en la capa portable `lib/…/core/` (SPEC 17): son datos puros que la
 * vista `components/settings/plan-overview.tsx` renderiza. Las filas reflejan la
 * monetización real de la app (límite de 20 lecturas del plan Free, analíticas
 * y reportes PDF en Premium).
 */

export interface PlanFeature {
  label: string
  /** `true`/`false` se pinta como check/equis; un `string` se muestra como texto. */
  free: boolean | string
  premium: boolean | string
}

export const PLAN_FEATURES: readonly PlanFeature[] = [
  {
    label: "Registro diario de presión arterial",
    free: true,
    premium: true
  },
  {
    label: "Categorías y alertas de emergencia",
    free: true,
    premium: true
  },
  {
    label: "Historial de lecturas",
    free: "Hasta 20",
    premium: "Ilimitado"
  },
  {
    label: "Promedios por periodo y tendencias",
    free: false,
    premium: true
  },
  {
    label: "Distribución por categoría",
    free: false,
    premium: true
  },
  {
    label: "Reportes PDF para tu médico",
    free: false,
    premium: true
  },
  {
    label: "Perfil y seguimiento de medicamentos",
    free: true,
    premium: true
  }
]
