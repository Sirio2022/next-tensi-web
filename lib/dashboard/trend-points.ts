import type { BloodPressureCategory } from "@/lib/readings/types"

/**
 * Entrada mínima de la gráfica de tendencia: sirve tanto para las lecturas
 * completas del dashboard Free como para la serie cruda de
 * `GET /bp-readings/analytics/trend` (sin `id` ni `category`).
 */
export interface TrendReadingInput {
  id?: string
  systolic: number
  diastolic: number
  timestamp: string
  category?: BloodPressureCategory
}

export interface TrendPoint {
  id: string
  label: string
  systolic: number
  diastolic: number
  /** Presente solo cuando la fuente lo trae (dashboard Free). */
  category?: BloodPressureCategory
}

const dateTimeFormatter = new Intl.DateTimeFormat("es-ES", {
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit"
})

/**
 * Convierte las lecturas crudas en puntos cronológicos para la gráfica. No
 * agrega ni promedia: solo etiqueta con la fecha/hora y proyecta los valores que
 * ya llegan del back. Ordena de forma ascendente por `timestamp`, de modo que
 * sirve tanto para las lecturas del dashboard (desc) como para la serie de
 * `GET /analytics/trend` (asc). Cuando la fuente no trae `id` se sintetiza uno a
 * partir del timestamp y la posición.
 */
export function buildTrendPoints(
  readings: readonly TrendReadingInput[]
): TrendPoint[] {
  return [...readings]
    .sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    )
    .map((reading, index) => ({
      id: reading.id ?? `${reading.timestamp}-${index}`,
      label: dateTimeFormatter.format(new Date(reading.timestamp)),
      systolic: reading.systolic,
      diastolic: reading.diastolic,
      ...(reading.category ? { category: reading.category } : {})
    }))
}
