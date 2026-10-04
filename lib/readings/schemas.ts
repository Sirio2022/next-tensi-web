import { z } from "zod"

/**
 * Schema zod del formulario de Nueva Lectura. Es la única fuente de validación
 * del cliente y replica `CreateBPReadingDto` de la API Nest (class-validator):
 * sistólica entera 50–250, diastólica entera 30–150, sistólica > diastólica,
 * pulso entero 30–220 opcional, notas opcionales, tags opcionales y timestamp
 * ISO opcional.
 */

const systolic = z
  .number({ error: "Introduce la presión sistólica" })
  .int("La presión sistólica debe ser un número entero")
  .min(50, "La presión sistólica debe estar entre 50 y 250")
  .max(250, "La presión sistólica debe estar entre 50 y 250")

const diastolic = z
  .number({ error: "Introduce la presión diastólica" })
  .int("La presión diastólica debe ser un número entero")
  .min(30, "La presión diastólica debe estar entre 30 y 150")
  .max(150, "La presión diastólica debe estar entre 30 y 150")

export const createReadingSchema = z
  .object({
    systolic,
    diastolic,
    pulse: z
      .number({ error: "El pulso debe ser un número" })
      .int("El pulso debe ser un número entero")
      .min(30, "El pulso debe estar entre 30 y 220")
      .max(220, "El pulso debe estar entre 30 y 220")
      .optional(),
    notes: z.string().optional(),
    tags: z.array(z.string()).optional(),
    timestamp: z.iso.datetime({ error: "La fecha no es válida" }).optional()
  })
  .refine((data) => data.systolic > data.diastolic, {
    error: "La presión sistólica debe ser mayor que la diastólica",
    path: ["diastolic"]
  })

export type CreateReadingFormValues = z.infer<typeof createReadingSchema>
