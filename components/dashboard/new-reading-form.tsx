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
  "w-full rounded-xl border border-line bg-card/60 px-4 py-2.5 text-sm text-fg placeholder-fg-subtle transition-colors focus:border-line-strong focus:outline-none"

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
            className="text-xs font-medium text-fg-muted"
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
              className="text-center text-xs text-tone-rose"
            >
              {notesError}
            </p>
          ) : null}
        </div>

        <div className="space-y-2 text-center">
          <label
            htmlFor="reading-datetime"
            className="text-xs font-medium text-fg-muted"
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
          <p role="alert" className="text-center text-xs text-tone-rose">
            {submitError}
          </p>
        ) : null}

        <Button
          ref={submitRef}
          type="submit"
          tone="primary"
          disabled={isPendingSubmission}
          aria-busy={isPendingSubmission}
          className="w-full bg-emerald-500 py-3 text-sm font-bold text-emerald-950 shadow-emerald-500/20 hover:bg-emerald-400"
        >
          {isPendingSubmission ? "Guardando..." : "Agregar Lectura"}
        </Button>
      </form>

      {showInlineWarning ? (
        <div
          aria-live="polite"
          className="flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-tone-amber"
        >
          <TriangleAlert
            className="mt-0.5 size-5 shrink-0 text-tone-amber"
            aria-hidden
          />
          <p className="leading-relaxed">
            <strong className="font-semibold text-tone-amber">
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
          <p className="flex items-center gap-2 text-xs font-medium text-tone-emerald">
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
              className="bg-card-muted text-fg shadow-none hover:bg-line-strong"
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
