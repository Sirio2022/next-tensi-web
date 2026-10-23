import { z } from "zod"
import { HH_MM_PATTERN, isValidIanaTimezone } from "./preferences"

/**
 * Schema zod espejo del `UpdateNotificationPreferencesDto` del back
 * (SPEC 20). Valida el formulario completo; el PATCH se envía con todos los
 * campos para que un solo request persista el estado de la sección.
 */

const timeField = z
  .string()
  .regex(HH_MM_PATTERN, "Usa el formato HH:mm (p. ej. 09:00)")

export const notificationPreferencesSchema = z
  .object({
    timezone: z
      .string()
      .refine(isValidIanaTimezone, "La zona horaria no es válida"),
    remindersEnabled: z.boolean(),
    reminderFrequency: z.enum(["DAILY", "TWICE_DAILY", "WEEKLY"]),
    reminderTime: timeField,
    reminderSecondTime: timeField.nullable(),
    reminderWeekday: z
      .number()
      .int()
      .min(1, "Elige un día de la semana")
      .max(7, "Elige un día de la semana")
      .nullable(),
    medicalAlertsEnabled: z.boolean(),
    alertHighEnabled: z.boolean(),
    alertLowEnabled: z.boolean(),
    alertIrregularEnabled: z.boolean(),
    weeklyReportEnabled: z.boolean(),
    monthlyReportEnabled: z.boolean(),
    reportByEmail: z.boolean(),
    reportInApp: z.boolean(),
    channelEmail: z.boolean(),
    channelPush: z.boolean(),
    channelInApp: z.boolean()
  })
  .superRefine((values, ctx) => {
    if (
      values.reminderFrequency === "TWICE_DAILY" &&
      values.reminderSecondTime === null
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["reminderSecondTime"],
        message: "Indica la segunda hora del recordatorio"
      })
    }

    if (
      values.reminderFrequency === "WEEKLY" &&
      values.reminderWeekday === null
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["reminderWeekday"],
        message: "Indica el día de la semana del recordatorio"
      })
    }
  })

export type NotificationPreferencesFormValues = z.infer<
  typeof notificationPreferencesSchema
>
