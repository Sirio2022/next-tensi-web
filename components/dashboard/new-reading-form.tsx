"use client"

import { Button } from "@/components/ui/button"
import { ButtonLink } from "@/components/ui/button-link"
import {
  READING_METRICS,
  type ReadingMetricId
} from "@/lib/dashboard/reading-form"
import {
  toReadingErrorMessage,
  useCreateReading
} from "@/lib/readings/hooks/use-create-reading"
import {
  createReadingSchema,
  type CreateReadingFormValues
} from "@/lib/readings/schemas"
import type {
  CreateReadingResponse,
  EmergencySeverity
} from "@/lib/readings/types"
import { zodResolver } from "@hookform/resolvers/zod"
import { CheckCircle2, TriangleAlert } from "lucide-react"
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { AiAnalysisCard } from "./ai-analysis-card"
import { ContextChips } from "./context-chips"
import { EmergencyAlertDialog } from "./emergency-alert-dialog"
import { MetricSlider } from "./metric-slider"

const INPUT_CLASSES =
  "w-full rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 transition-colors focus:border-slate-600 focus:outline-none"

const dateTimeFormatter = new Intl.DateTimeFormat("es-ES", {
  dateStyle: "long",
  timeStyle: "short"
})

function metricDefault(id: ReadingMetricId): number {
  return READING_METRICS.find((metric) => metric.id === id)?.defaultValue ?? 0
}

function isCrisis(severity: EmergencySeverity): boolean {
  return (
    severity === "CRISIS_HYPERTENSIVE" || severity === "CRISIS_HYPOTENSIVE"
  )
}

/**
 * Formulario real de Nueva Lectura. Valida con zod (React Hook Form +
 * `zodResolver`), envía `POST /bp-readings` con `useCreateReading` y, al
 * guardar, muestra el análisis IA del back, la alerta de emergencia y enlaces al
 * dashboard/historial. El `timestamp` se envía como ISO "ahora"; la fecha/hora
 * mostrada es de solo lectura.
 */
export function NewReadingForm() {
  const [displayedAt] = useState(() => new Date())
  const [isDialogOpen, setDialogOpen] = useState(false)
  const { mutateAsync, isPending } = useCreateReading()

  const {
    control,
    register,
    handleSubmit,
    setError,
    formState: { errors }
  } = useForm<CreateReadingFormValues>({
    resolver: zodResolver(createReadingSchema),
    defaultValues: {
      systolic: metricDefault("systolic"),
      diastolic: metricDefault("diastolic"),
      pulse: metricDefault("pulse"),
      notes: "",
      tags: [],
      timestamp: undefined
    }
  })

  const [result, setResult] = useState<CreateReadingResponse | null>(null)

  const onSubmit = handleSubmit(async (values) => {
    try {
      const response = await mutateAsync({
        systolic: values.systolic,
        diastolic: values.diastolic,
        pulse: values.pulse,
        notes: values.notes?.trim() ? values.notes.trim() : undefined,
        tags: values.tags?.length ? values.tags : undefined,
        timestamp: new Date().toISOString()
      })

      setResult(response)
      setDialogOpen(isCrisis(response.emergencyAssessment.severity))
    } catch (caught) {
      setError("root", { message: toReadingErrorMessage(caught) })
    }
  })

  const severity = result?.emergencyAssessment.severity
  const showInlineWarning = severity === "WARNING"
  const submitError = errors.root?.message

  return (
    <div className="space-y-6">
      <form className="space-y-6" onSubmit={onSubmit} noValidate>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {READING_METRICS.slice(0, 2).map((metric) => (
            <div key={metric.id} className="space-y-1">
              <Controller
                control={control}
                name={metric.id}
                render={({ field }) => (
                  <MetricSlider
                    metric={metric}
                    value={field.value ?? metric.defaultValue}
                    onValueChange={field.onChange}
                  />
                )}
              />
              {errors[metric.id]?.message ? (
                <p className="text-center text-xs text-rose-400">
                  {errors[metric.id]?.message}
                </p>
              ) : null}
            </div>
          ))}
        </div>

        {READING_METRICS.slice(2).map((metric) => (
          <Controller
            key={metric.id}
            control={control}
            name={metric.id}
            render={({ field }) => (
              <MetricSlider
                metric={metric}
                value={field.value ?? metric.defaultValue}
                onValueChange={field.onChange}
              />
            )}
          />
        ))}

        <Controller
          control={control}
          name="tags"
          render={({ field }) => (
            <ContextChips
              selected={field.value ?? []}
              onToggle={(tag) => {
                const current = field.value ?? []
                const next = current.includes(tag)
                  ? current.filter((selected) => selected !== tag)
                  : [...current, tag]
                field.onChange(next)
              }}
            />
          )}
        />

        <div className="space-y-2 text-center">
          <label
            htmlFor="reading-notes"
            className="text-xs font-medium text-slate-300"
          >
            Notas
          </label>
          <textarea
            id="reading-notes"
            rows={3}
            placeholder="Notas adicionales (opcional)"
            className={`${INPUT_CLASSES} resize-y`}
            {...register("notes")}
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
            value={dateTimeFormatter.format(displayedAt)}
            readOnly
            className={`${INPUT_CLASSES} text-center`}
          />
        </div>

        {submitError ? (
          <p role="alert" className="text-center text-xs text-rose-400">
            {submitError}
          </p>
        ) : null}

        <Button
          type="submit"
          tone="primary"
          disabled={isPending}
          className="w-full bg-emerald-500 py-3 text-sm font-bold text-slate-950 shadow-emerald-500/20 hover:bg-emerald-400"
        >
          {isPending ? "Guardando..." : "Agregar Lectura"}
        </Button>
      </form>

      {showInlineWarning ? (
        <div
          aria-live="polite"
          className="flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-200/90"
        >
          <TriangleAlert className="mt-0.5 size-5 shrink-0 text-amber-400" aria-hidden />
          <p className="leading-relaxed">
            <strong className="font-semibold text-amber-300">
              {result?.emergencyAssessment.uiMessage.title}
            </strong>{" "}
            {result?.emergencyAssessment.uiMessage.body}
          </p>
        </div>
      ) : null}

      {result ? (
        <div
          aria-live="polite"
          className="flex flex-col gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <p className="flex items-center gap-2 text-xs font-medium text-emerald-200">
            <CheckCircle2 className="size-4 shrink-0" aria-hidden />
            Lectura guardada correctamente.
          </p>
          <div className="flex gap-2">
            <ButtonLink href="/dashboard" size="sm">
              Ir al Dashboard
            </ButtonLink>
            <ButtonLink
              href="/dashboard/history"
              size="sm"
              className="bg-slate-800 text-slate-200 shadow-none hover:bg-slate-700"
            >
              Ver Historial
            </ButtonLink>
          </div>
        </div>
      ) : null}

      <AiAnalysisCard analysis={result?.analysis} />

      {result && isDialogOpen ? (
        <EmergencyAlertDialog
          assessment={result.emergencyAssessment}
          open={isDialogOpen}
          onClose={() => setDialogOpen(false)}
        />
      ) : null}
    </div>
  )
}
