import type { ToneName } from "@/components/ui/tone-classes"
import type { BloodPressureCategory } from "./types"

/**
 * Mapa de presentación `BloodPressureCategory → { label, tone }`.
 *
 * Solo traduce el enum que ya calculó el back a copy y color. **No** duplica
 * rangos numéricos ni categoriza valores: la clasificación WHO vive en la API
 * y, en el front, en `lib/bp/bp-categories.ts`.
 */
interface CategoryPresentation {
  label: string
  tone: ToneName
}

export const BP_CATEGORY_PRESENTATION: Record<
  BloodPressureCategory,
  CategoryPresentation
> = {
  severe_hypotension: { label: "Hipotensión Severa", tone: "rose" },
  moderate_hypotension: { label: "Hipotensión Moderada", tone: "orange" },
  mild_hypotension: { label: "Hipotensión Leve", tone: "sky" },
  optimal: { label: "Óptima", tone: "emerald" },
  normal: { label: "Normal", tone: "emerald-soft" },
  high_normal: { label: "Normal Alta", tone: "amber" },
  grade_1_hypertension: { label: "Hipertensión 1", tone: "orange" },
  grade_2_hypertension: { label: "Hipertensión 2", tone: "rose" },
  grade_3_hypertension: { label: "Hipertensión 3", tone: "rose" }
}

/** Devuelve label y tono de una categoría, con fallback neutro. */
export function getCategoryPresentation(category: BloodPressureCategory) {
  return BP_CATEGORY_PRESENTATION[category]
}
