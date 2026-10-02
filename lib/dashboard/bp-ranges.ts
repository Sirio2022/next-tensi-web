import type { BpCategory } from "@/lib/bp/bp-categories"

/** Tonos visuales disponibles para los rangos. */
export type BpRangeTone =
  | "sky"
  | "emerald"
  | "emerald-soft"
  | "amber"
  | "orange"
  | "rose"

export interface BpRangeDisplay {
  label: string
  range: string
  tone: BpRangeTone
  /** Categorías de `lib/bp/bp-categories.ts` que caen en este rango. */
  categories: readonly BpCategory[]
}

/**
 * Referencia **educativa** de 6 filas del mockup, no la categorización real de
 * la app. Los números mostrados son copy informativo; la tabla de rangos
 * numéricos fuente única vive en `lib/bp/bp-categories.ts` (espejo del backend)
 * y `categories` solo agrupa categorías existentes para atar la vista a ella.
 */
export const BP_RANGE_DISPLAY: readonly BpRangeDisplay[] = [
  {
    label: "Hipotensión",
    range: "< 90 / 60",
    tone: "sky",
    categories: [
      "mild_hypotension",
      "moderate_hypotension",
      "severe_hypotension"
    ]
  },
  {
    label: "Óptima",
    range: "< 120 / 80",
    tone: "emerald",
    categories: ["optimal"]
  },
  {
    label: "Normal",
    range: "120-129 / 80-84",
    tone: "emerald-soft",
    categories: ["normal"]
  },
  {
    label: "Normal Alta",
    range: "130-139 / 85-89",
    tone: "amber",
    categories: ["high_normal"]
  },
  {
    label: "Hipertensión 1",
    range: "140-159 / 90-99",
    tone: "orange",
    categories: ["grade_1_hypertension"]
  },
  {
    label: "Hipertensión 2",
    range: "≥ 160 / 100",
    tone: "rose",
    categories: ["grade_2_hypertension", "grade_3_hypertension"]
  }
]
