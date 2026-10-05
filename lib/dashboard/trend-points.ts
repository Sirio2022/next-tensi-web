import type { BPReading } from "@/lib/readings/types"

export interface TrendPoint {
  id: string
  label: string
  systolic: number
  diastolic: number
  category: BPReading["category"]
}

const dateTimeFormatter = new Intl.DateTimeFormat("es-ES", {
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit"
})

/**
 * Convierte las lecturas crudas (de más reciente a más antigua) en puntos
 * cronológicos para la gráfica. No agrega ni promedia: solo etiqueta con la
 * fecha/hora y proyecta los valores que ya llegan del back.
 */
export function buildTrendPoints(
  readings: readonly BPReading[]
): TrendPoint[] {
  return [...readings].reverse().map((reading) => ({
    id: reading.id,
    label: dateTimeFormatter.format(new Date(reading.timestamp)),
    systolic: reading.systolic,
    diastolic: reading.diastolic,
    category: reading.category
  }))
}
