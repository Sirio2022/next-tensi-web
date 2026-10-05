/**
 * Constantes de presentación del formulario de Nueva Lectura. No hay modelo de
 * datos ni llamadas a API: la persistencia entra en la spec de funcionalidad.
 */

export type ReadingMetricId = "systolic" | "diastolic" | "pulse"

export interface ReadingMetric {
  id: ReadingMetricId
  label: string
  unit: "mmHg" | "BPM"
  min: number
  max: number
  defaultValue: number
  /**
   * Clases del acento (color del valor y `accent-*` del slider). Se aplican
   * tanto al `<span>` del valor como al `<input type="range">`; cada utilidad
   * es inocua en el nodo donde no aplica.
   */
  accentClassName: string
}

/**
 * Métricas del formulario, en el orden del mockup. Los acentos son semánticos
 * (sistólica roja, diastólica azul, pulso púrpura) y se conservan del mockup.
 */
export const READING_METRICS: readonly ReadingMetric[] = [
  {
    id: "systolic",
    label: "Presión Sistólica",
    unit: "mmHg",
    min: 70,
    max: 200,
    defaultValue: 120,
    accentClassName: "text-red-500 accent-red-500"
  },
  {
    id: "diastolic",
    label: "Presión Diastólica",
    unit: "mmHg",
    min: 40,
    max: 130,
    defaultValue: 80,
    accentClassName: "text-blue-500 accent-blue-500"
  },
  {
    id: "pulse",
    label: "Pulso (BPM)",
    unit: "BPM",
    min: 40,
    max: 180,
    defaultValue: 70,
    accentClassName: "text-purple-400 accent-purple-500"
  }
]

/** Valor por defecto de una métrica (0 si el id no existe). */
export function getMetricDefault(id: ReadingMetricId): number {
  return READING_METRICS.find((metric) => metric.id === id)?.defaultValue ?? 0
}

/** Chips de contexto del mockup, en su orden. */
export const READING_CONTEXT_TAGS: readonly string[] = [
  "Ejercicio físico",
  "Tareas domésticas",
  "Comí recientemente",
  "Olvidé medicina",
  "Estrés / Ansiedad",
  "Sueño insuficiente",
  "Fumar",
  "Cafeína / Alcohol",
  "Clima frío",
  "Dolor",
  "Otras"
]
