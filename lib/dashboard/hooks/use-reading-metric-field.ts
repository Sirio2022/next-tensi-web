"use client"

import {
  READING_METRICS,
  type ReadingMetricId
} from "@/lib/dashboard/reading-form"
import type { CreateReadingFormValues } from "@/lib/readings/schemas"
import { useController, type Control } from "react-hook-form"

const METRIC_ERROR_ID_PREFIX = "reading-error-"

/**
 * Suscribe una métrica a su propio campo de React Hook Form. Al vivir en su
 * boundary, mover su slider solo re-renderiza ese subárbol, no el formulario
 * padre.
 */
export function useReadingMetricField(
  control: Control<CreateReadingFormValues>,
  metricId: ReadingMetricId
) {
  const { field, fieldState } = useController<
    CreateReadingFormValues,
    ReadingMetricId
  >({
    control,
    name: metricId
  })

  const metric = READING_METRICS.find((candidate) => candidate.id === metricId)

  return {
    metric,
    value: field.value ?? metric?.defaultValue ?? 0,
    onValueChange: field.onChange,
    errorMessage: fieldState.error?.message,
    errorId: `${METRIC_ERROR_ID_PREFIX}${metricId}`
  }
}
