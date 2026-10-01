// Espejo de `BloodPressureCategory` de `prisma/schema.prisma` (nest-tensi-api).
export type BpCategory =
  | 'severe_hypotension'
  | 'moderate_hypotension'
  | 'mild_hypotension'
  | 'optimal'
  | 'normal'
  | 'high_normal'
  | 'grade_1_hypertension'
  | 'grade_2_hypertension'
  | 'grade_3_hypertension'

// Buckets visuales de la landing: colapsan las 9 categorías WHO a 5 estados.
export type BpVisualBucket =
  | 'saludable'
  | 'atencion'
  | 'riesgo_moderado'
  | 'consultar_medico'
  | 'presion_baja'

interface BpCategoryRange {
  sys: [number, number | null]
  dia: [number, number | null]
  category: BpCategory
}

/**
 * Tabla de rangos idéntica a `BloodPressureCategorizer` del backend
 * (`nest-tensi-api/src/bp-readings/utils/bp-categorizer.util.ts`).
 *
 * Se recorre de la categoría más severa a la menos; para hipertensión basta con
 * que **una** de las dos presiones caiga en el rango, para hipotensión deben
 * caer **ambas**. Un valor fuera de todos los rangos cae al fallback
 * `severe_hypotension`, igual que en el backend.
 */
export const BP_CATEGORIES: readonly BpCategoryRange[] = [
  { sys: [180, null], dia: [110, null], category: 'grade_3_hypertension' },
  { sys: [160, 179], dia: [100, 109], category: 'grade_2_hypertension' },
  { sys: [140, 159], dia: [90, 99], category: 'grade_1_hypertension' },
  { sys: [130, 139], dia: [85, 89], category: 'high_normal' },
  { sys: [120, 129], dia: [80, 84], category: 'normal' },
  { sys: [100, 119], dia: [70, 79], category: 'optimal' },
  { sys: [90, 99], dia: [60, 69], category: 'mild_hypotension' },
  { sys: [80, 89], dia: [50, 59], category: 'moderate_hypotension' },
  { sys: [0, 79], dia: [0, 49], category: 'severe_hypotension' },
]

function valueInRange(
  value: number,
  min: number,
  max: number | null,
): boolean {
  return value >= min && (max === null || value <= max)
}

/**
 * Réplica de `BloodPressureCategorizer.categorize()` del backend. Recorre la
 * tabla de la más severa a la menos aplicando el criterio OR/AND descrito.
 */
export function categorize(systolic: number, diastolic: number): BpCategory {
  for (const { sys, dia, category } of BP_CATEGORIES) {
    const systolicMatch = valueInRange(systolic, sys[0], sys[1])
    const diastolicMatch = valueInRange(diastolic, dia[0], dia[1])

    if (category.includes('hypotension')) {
      if (systolicMatch && diastolicMatch) return category
    } else if (systolicMatch || diastolicMatch) {
      return category
    }
  }

  return 'severe_hypotension'
}

const CATEGORY_TO_BUCKET: Record<BpCategory, BpVisualBucket> = {
  optimal: 'saludable',
  normal: 'saludable',
  high_normal: 'atencion',
  grade_1_hypertension: 'riesgo_moderado',
  grade_2_hypertension: 'consultar_medico',
  grade_3_hypertension: 'consultar_medico',
  mild_hypotension: 'presion_baja',
  moderate_hypotension: 'presion_baja',
  severe_hypotension: 'presion_baja',
}

/** Colapsa la categoría WHO a uno de los 5 buckets visuales de la landing. */
export function categoryToBucket(category: BpCategory): BpVisualBucket {
  return CATEGORY_TO_BUCKET[category]
}
