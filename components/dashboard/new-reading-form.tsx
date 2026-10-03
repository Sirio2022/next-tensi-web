"use client"

import {
  READING_METRICS,
  type ReadingMetricId
} from "@/lib/dashboard/reading-form"
import { useState } from "react"
import { ContextChips } from "./context-chips"
import { MetricSlider } from "./metric-slider"

/** Fecha/hora de referencia del mockup; el "ahora" real entra en otra spec. */
const READING_DATE_DISPLAY = "01/10/2026, 09:38 a.m."

type MetricValues = Record<ReadingMetricId, number>

/** Valores iniciales derivados de `READING_METRICS` (fuente única). */
function initialMetricValues(): MetricValues {
  return Object.fromEntries(
    READING_METRICS.map((metric) => [metric.id, metric.defaultValue])
  ) as MetricValues
}

const INPUT_CLASSES =
  "w-full rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 transition-colors focus:border-slate-600 focus:outline-none"

/**
 * Formulario visual de Nueva Lectura: sliders, chips, notas, fecha/hora de solo
 * lectura y submit no-op. Todo el estado es local; no hay persistencia ni API
 * (eso entra en la spec de funcionalidad).
 */
export function NewReadingForm() {
  const [values, setValues] = useState<MetricValues>(initialMetricValues)
  const [selectedTags, setSelectedTags] = useState<readonly string[]>([])
  const [notes, setNotes] = useState("")

  function handleMetricChange(id: ReadingMetricId, value: number) {
    setValues((current) => ({ ...current, [id]: value }))
  }

  function handleTagToggle(tag: string) {
    setSelectedTags((current) =>
      current.includes(tag)
        ? current.filter((selected) => selected !== tag)
        : [...current, tag]
    )
  }

  const renderMetric = (metric: (typeof READING_METRICS)[number]) => (
    <MetricSlider
      key={metric.id}
      metric={metric}
      value={values[metric.id]}
      onValueChange={(value) => handleMetricChange(metric.id, value)}
    />
  )

  return (
    <form className="space-y-6" onSubmit={(event) => event.preventDefault()}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {READING_METRICS.slice(0, 2).map(renderMetric)}
      </div>

      {READING_METRICS.slice(2).map(renderMetric)}

      <ContextChips selected={selectedTags} onToggle={handleTagToggle} />

      <div className="space-y-2 text-center">
        <label
          htmlFor="reading-notes"
          className="text-xs font-medium text-slate-300"
        >
          Notas
        </label>
        <input
          id="reading-notes"
          type="text"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Notas adicionales (opcional)"
          className={INPUT_CLASSES}
        />
      </div>

      <div className="space-y-2 text-center">
        <label
          htmlFor="reading-datetime"
          className="text-xs font-medium text-slate-300"
        >
          Fecha y hora de la medición
        </label>
        <input
          id="reading-datetime"
          type="text"
          value={READING_DATE_DISPLAY}
          readOnly
          className={`${INPUT_CLASSES} text-center`}
        />
      </div>

      <button
        type="submit"
        className="w-full rounded-xl bg-emerald-500 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-400 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 focus-visible:outline-none active:scale-[0.99]"
      >
        Agregar Lectura
      </button>
    </form>
  )
}
