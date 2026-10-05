"use client"

import { useReadingContextField } from "@/lib/dashboard/hooks/use-reading-context-field"
import { useReadingMetricField } from "@/lib/dashboard/hooks/use-reading-metric-field"
import {
  READING_METRICS,
  type ReadingMetricId
} from "@/lib/dashboard/reading-form"
import type { CreateReadingFormValues } from "@/lib/readings/schemas"
import type { Control } from "react-hook-form"
import { ContextChips } from "./context-chips"
import { MetricSlider } from "./metric-slider"

interface ReadingInputsProps {
  control: Control<CreateReadingFormValues>
}

/** Error de una métrica, anunciado a tecnologías de asistencia. */
function MetricError({ id, message }: Readonly<{ id: string; message: string }>) {
  return (
    <p
      id={id}
      role="alert"
      className="text-center text-xs text-rose-400"
    >
      {message}
    </p>
  )
}

/**
 * Tarjeta de una métrica suscrita a su propio campo (`useReadingMetricField`).
 * Al vivir dentro de este boundary, mover su slider solo re-renderiza este
 * subárbol, no el formulario padre.
 */
function ReadingMetricField({
  control,
  metricId
}: Readonly<{
  control: Control<CreateReadingFormValues>
  metricId: ReadingMetricId
}>) {
  const { metric, value, onValueChange, errorMessage, errorId } =
    useReadingMetricField(control, metricId)

  if (!metric) {
    return null
  }

  return (
    <div className="space-y-1">
      <MetricSlider
        metric={metric}
        value={value}
        onValueChange={onValueChange}
      />
      {errorMessage ? <MetricError id={errorId} message={errorMessage} /> : null}
    </div>
  )
}

/** Chips de contexto suscritos al campo `tags`, aislados del resto del formulario. */
function ReadingContextField({
  control
}: Readonly<{ control: Control<CreateReadingFormValues> }>) {
  const { selected, toggleTag } = useReadingContextField(control)

  return <ContextChips selected={selected} onToggle={toggleTag} />
}

/**
 * Boundary de los campos "vivos" del formulario (métricas + chips de contexto).
 * Aísla el estado transitorio de la captura para que cada interacción con los
 * sliders/chips no re-renderice el formulario completo. Recibe el `control` de
 * RHF y se suscribe por campo con los hooks de `lib/dashboard/hooks`.
 */
export function ReadingInputs({ control }: Readonly<ReadingInputsProps>) {
  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {READING_METRICS.slice(0, 2).map((metric) => (
          <ReadingMetricField key={metric.id} control={control} metricId={metric.id} />
        ))}
      </div>

      {READING_METRICS.slice(2).map((metric) => (
        <ReadingMetricField key={metric.id} control={control} metricId={metric.id} />
      ))}

      <ReadingContextField control={control} />
    </>
  )
}
