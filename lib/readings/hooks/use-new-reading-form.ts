"use client"

import { getMetricDefault } from "@/lib/dashboard/reading-form"
import { isCrisisSeverity } from "@/lib/readings/emergency"
import {
  toReadingErrorMessage,
  useCreateReading
} from "@/lib/readings/hooks/use-create-reading"
import {
  createReadingSchema,
  type CreateReadingFormValues
} from "@/lib/readings/schemas"
import type { CreateReadingResponse } from "@/lib/readings/types"
import { zodResolver } from "@hookform/resolvers/zod"
import { useId, useRef, useState } from "react"
import { useForm } from "react-hook-form"

/**
 * Estado y wiring del formulario de Nueva Lectura: React Hook Form + zod,
 * `POST /bp-readings` con `useCreateReading` y, al guardar, el análisis IA del
 * back y la alerta de emergencia. El `timestamp` se envía como ISO "ahora"; la
 * fecha/hora mostrada es de solo lectura.
 */
export function useNewReadingForm() {
  const [displayedAt] = useState(() => new Date())
  const [isDialogOpen, setDialogOpen] = useState(false)
  const notesErrorId = useId()
  const submitRef = useRef<HTMLButtonElement>(null)
  const { mutateAsync, isPending } = useCreateReading()

  const {
    control,
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting }
  } = useForm<CreateReadingFormValues>({
    resolver: zodResolver(createReadingSchema),
    defaultValues: {
      systolic: getMetricDefault("systolic"),
      diastolic: getMetricDefault("diastolic"),
      pulse: getMetricDefault("pulse"),
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
      setDialogOpen(isCrisisSeverity(response.emergencyAssessment.severity))
    } catch (error) {
      setError("root", { message: toReadingErrorMessage(error) })
    }
  })

  const severity = result?.emergencyAssessment.severity

  return {
    displayedAt,
    control,
    register,
    onSubmit,
    submitRef,
    notesErrorId,
    notesError: errors.notes?.message,
    submitError: errors.root?.message,
    isPendingSubmission: isPending || isSubmitting,
    showInlineWarning: severity === "WARNING",
    result,
    isDialogOpen,
    closeDialog: () => setDialogOpen(false)
  }
}
