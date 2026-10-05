"use client"

import { Button } from "@/components/ui/button"
import { ButtonLink } from "@/components/ui/button-link"
import { formatReadingDateTime } from "@/lib/readings/format"
import { useNewReadingForm } from "@/lib/readings/hooks/use-new-reading-form"
import { CheckCircle2, TriangleAlert } from "lucide-react"
import { AiAnalysisCard } from "./ai-analysis-card"
import { EmergencyAlertDialog } from "./emergency-alert-dialog"
import { ReadingInputs } from "./reading-inputs"

const INPUT_CLASSES =
  "w-full rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 transition-colors focus:border-slate-600 focus:outline-none"

interface NewReadingFormProps {
  /** Plan del usuario resuelto en el server; decide el pie de la tarjeta IA. */
  isPremium: boolean
}

/**
 * Formulario real de Nueva Lectura. El estado y el wiring viven en
 * `useNewReadingForm`; este componente solo renderiza el resultado y muestra el
 * análisis IA, la alerta de emergencia y los enlaces al dashboard/historial.
 */
export function NewReadingForm({ isPremium }: Readonly<NewReadingFormProps>) {
  const {
    displayedAt,
    control,
    register,
    onSubmit,
    submitRef,
    notesErrorId,
    notesError,
    submitError,
    isPendingSubmission,
    showInlineWarning,
    result,
    isDialogOpen,
    closeDialog
  } = useNewReadingForm()

  return (
    <div className="space-y-6">
      <form
        className="space-y-6"
        onSubmit={onSubmit}
        aria-busy={isPendingSubmission}
        noValidate
      >
        <ReadingInputs control={control} />

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
            aria-invalid={notesError ? true : undefined}
            aria-describedby={notesError ? notesErrorId : undefined}
            className={`${INPUT_CLASSES} resize-y`}
            {...register("notes")}
          />
          {notesError ? (
            <p
              id={notesErrorId}
              role="alert"
              className="text-center text-xs text-rose-400"
            >
              {notesError}
            </p>
          ) : null}
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
            value={formatReadingDateTime(displayedAt)}
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
          ref={submitRef}
          type="submit"
          tone="primary"
          disabled={isPendingSubmission}
          aria-busy={isPendingSubmission}
          className="w-full bg-emerald-500 py-3 text-sm font-bold text-slate-950 shadow-emerald-500/20 hover:bg-emerald-400"
        >
          {isPendingSubmission ? "Guardando..." : "Agregar Lectura"}
        </Button>
      </form>

      {showInlineWarning ? (
        <div
          aria-live="polite"
          className="flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-200/90"
        >
          <TriangleAlert
            className="mt-0.5 size-5 shrink-0 text-amber-400"
            aria-hidden
          />
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

      <AiAnalysisCard analysis={result?.analysis} isPremium={isPremium} />

      {result && isDialogOpen ? (
        <EmergencyAlertDialog
          assessment={result.emergencyAssessment}
          open={isDialogOpen}
          onClose={closeDialog}
          returnFocusRef={submitRef}
        />
      ) : null}
    </div>
  )
}
