import type { ToneName } from "@/components/ui/tone-classes"
import type { Route } from "next"
import { BP_CATEGORY_PRESENTATION, getCategoryPresentation } from "./categories"
import type {
  AnalyticsPeriod,
  AnalyticsRange,
  CategoryDistributionPoint,
  CategoryStat,
  PeriodAverage,
  WeeklyAverage,
  MonthlyAverage,
  YearlyAverage
} from "./analytics-types"
import type { BloodPressureCategory } from "./types"

/**
 * Helpers puros de presentación de las analíticas Premium. Aquí **no** se
 * calcula salud ni agregados: solo se formatean y ordenan los datos que ya
 * entrega la API (`/bp-readings/analytics*`).
 */

/** Orden canónico de categorías para tablas y leyendas (severa → óptima). */
const CATEGORY_ORDER = Object.keys(
  BP_CATEGORY_PRESENTATION
) as BloodPressureCategory[]

const shortMonthYearFormatter = new Intl.DateTimeFormat("es-ES", {
  month: "short",
  year: "numeric"
})

/**
 * Paleta hex de los tonos para SVG (Recharts y barras CSS). Espejo de
 * `TONE_CLASSES`, que solo expresa las clases de Tailwind.
 */
export const TONE_HEX: Record<ToneName, string> = {
  neutral: "#94a3b8",
  sky: "#38bdf8",
  emerald: "#34d399",
  "emerald-soft": "#6ee7b7",
  amber: "#fbbf24",
  orange: "#fb923c",
  rose: "#fb7185"
}

/**
 * Fechas ISO de inicio/fin de una ventana relativa a "ahora" (7 o 30 días) que
 * alimentan `GET /bp-readings/analytics/trend?startDate=&endDate=`.
 */
export function getRangeDates(
  range: AnalyticsRange,
  now: Date = new Date()
): { startDate: string; endDate: string } {
  const days = range === "7d" ? 7 : 30
  const start = new Date(now)
  start.setDate(start.getDate() - days)

  return { startDate: start.toISOString(), endDate: now.toISOString() }
}

const PERIOD_LABELS: Record<AnalyticsPeriod, string> = {
  weekly: "Semanal",
  monthly: "Mensual",
  yearly: "Anual"
}

const ANALYTICS_RANGES: readonly AnalyticsRange[] = ["7d", "30d"]
const ANALYTICS_PERIODS: readonly AnalyticsPeriod[] = [
  "weekly",
  "monthly",
  "yearly"
]

/** `?range=` → rango válido; cualquier otro valor (o ausente) cae a `7d`. */
export function parseAnalyticsRange(
  value: string | string[] | undefined
): AnalyticsRange {
  const raw = Array.isArray(value) ? value[0] : value
  return ANALYTICS_RANGES.includes(raw as AnalyticsRange)
    ? (raw as AnalyticsRange)
    : "7d"
}

/** `?period=` → granularidad válida; cualquier otro valor cae a `weekly`. */
export function parseAnalyticsPeriod(
  value: string | string[] | undefined
): AnalyticsPeriod {
  const raw = Array.isArray(value) ? value[0] : value
  return ANALYTICS_PERIODS.includes(raw as AnalyticsPeriod)
    ? (raw as AnalyticsPeriod)
    : "weekly"
}

/** Etiqueta humana de la granularidad de promedios. */
export function getPeriodLabel(period: AnalyticsPeriod): string {
  return PERIOD_LABELS[period]
}

/** URL compartible de `/dashboard/analytics` con sus dos ejes de filtro. */
export function buildAnalyticsHref({
  range,
  period
}: {
  range: AnalyticsRange
  period: AnalyticsPeriod
}): Route {
  const params = new URLSearchParams({ range, period })
  return `/dashboard/analytics?${params.toString()}` as Route
}

export interface CategorySeriesPoint {
  category: BloodPressureCategory
  label: string
  tone: ToneName
  count: number
}

/** Distribución por categoría → puntos ordenados con label, tono y conteo. */
export function buildCategorySeries(
  distribution: Partial<Record<BloodPressureCategory, number>>
): CategorySeriesPoint[] {
  return CATEGORY_ORDER.filter((category) => (distribution[category] ?? 0) > 0).map(
    (category) => {
      const { label, tone } = getCategoryPresentation(category)
      return { category, label, tone, count: distribution[category] ?? 0 }
    }
  )
}

/** Ordena las stats por el orden canónico de categorías (severa → óptima). */
export function orderCategoryStats(
  stats: readonly CategoryStat[]
): CategoryStat[] {
  return [...stats].sort(
    (a, b) =>
      CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category)
  )
}

export interface AveragePoint {
  label: string
  avgSystolic: number
  avgDiastolic: number
}

function averagePointLabel(
  period: AnalyticsPeriod,
  point: PeriodAverage
): string {
  switch (period) {
    case "weekly": {
      const { week, year } = point as WeeklyAverage
      return `Sem ${week} · ${year}`
    }
    case "monthly": {
      const { month, year } = point as MonthlyAverage
      return shortMonthYearFormatter.format(new Date(year, month - 1, 1))
    }
    case "yearly":
      return String((point as YearlyAverage).year)
  }
}

/** Uniforma weekly/monthly/yearly a puntos `{ label, avgSystolic, avgDiastolic }`. */
export function buildAveragePoints(
  period: AnalyticsPeriod,
  data: readonly PeriodAverage[]
): AveragePoint[] {
  return data.map((point) => ({
    label: averagePointLabel(period, point),
    avgSystolic: point.avgSystolic,
    avgDiastolic: point.avgDiastolic
  }))
}

export interface EvolutionPoint {
  /** Clave estable `YYYY-MM` para ordenar y usar de key de React. */
  key: string
  label: string
  counts: Partial<Record<BloodPressureCategory, number>>
}

export interface EvolutionSeries {
  /** Categorías presentes en los datos, en orden canónico, con label y tono. */
  categories: CategorySeriesPoint[]
  /** Un punto por mes, en orden cronológico. */
  points: EvolutionPoint[]
}

/**
 * Evolución mensual por categoría: agrupa por mes y limita las series a las
 * categorías realmente presentes en los datos.
 */
export function buildEvolutionSeries(
  points: readonly CategoryDistributionPoint[]
): EvolutionSeries {
  const months = new Map<string, EvolutionPoint>()
  const totals = new Map<BloodPressureCategory, number>()

  for (const point of points) {
    const key = `${point.year}-${String(point.month).padStart(2, "0")}`
    const month = months.get(key) ?? {
      key,
      label: shortMonthYearFormatter.format(
        new Date(point.year, point.month - 1, 1)
      ),
      counts: {}
    }

    month.counts[point.category] = (month.counts[point.category] ?? 0) + point.count
    months.set(key, month)

    totals.set(point.category, (totals.get(point.category) ?? 0) + point.count)
  }

  const categories = CATEGORY_ORDER.filter(
    (category) => (totals.get(category) ?? 0) > 0
  ).map((category) => {
    const { label, tone } = getCategoryPresentation(category)
    return { category, label, tone, count: totals.get(category) ?? 0 }
  })

  const ordered = [...months.values()].sort((a, b) => a.key.localeCompare(b.key))

  return { categories, points: ordered }
}

export interface WeeklyChange {
  direction: "up" | "down" | "flat"
  /** Flecha + porcentaje con signo, p. ej. `↑ +5 %`, `↓ -3 %`, `→ 0 %`. */
  text: string
}

/** Variación semanal → flecha + `±N %`; `null` sin base de comparación. */
export function formatWeeklyChange(
  changePercent: number | null
): WeeklyChange | null {
  if (changePercent === null || !Number.isFinite(changePercent)) return null

  if (changePercent > 0) {
    return { direction: "up", text: `↑ +${changePercent} %` }
  }

  if (changePercent < 0) {
    return { direction: "down", text: `↓ ${changePercent} %` }
  }

  return { direction: "flat", text: "→ 0 %" }
}
