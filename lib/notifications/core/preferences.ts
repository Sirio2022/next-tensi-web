import type { NotificationPreferences, ReminderFrequency } from "./types"

/**
 * Defaults de notificación, espejo de `NotificationPreference` en el back
 * (SPEC 20). Se usan como fallback y para construir una fila nueva.
 */
export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  timezone: "UTC",
  remindersEnabled: false,
  reminderFrequency: "DAILY",
  reminderTime: "09:00",
  reminderSecondTime: null,
  reminderWeekday: null,
  medicalAlertsEnabled: true,
  alertHighEnabled: true,
  alertLowEnabled: false,
  alertIrregularEnabled: true,
  weeklyReportEnabled: false,
  monthlyReportEnabled: false,
  reportByEmail: true,
  reportInApp: true,
  channelEmail: true,
  channelPush: false,
  channelInApp: true
}

export interface ReminderFrequencyOption {
  value: ReminderFrequency
  label: string
  description: string
}

export const REMINDER_FREQUENCY_OPTIONS: readonly ReminderFrequencyOption[] = [
  {
    value: "DAILY",
    label: "Diario",
    description: "Un recordatorio al día"
  },
  {
    value: "TWICE_DAILY",
    label: "Dos veces al día",
    description: "Mañana y noche"
  },
  {
    value: "WEEKLY",
    label: "Semanal",
    description: "Un día a la semana"
  }
]

export interface WeekdayOption {
  value: number
  label: string
}

/** Día ISO: 1 = lunes … 7 = domingo. */
export const WEEKDAY_OPTIONS: readonly WeekdayOption[] = [
  { value: 1, label: "Lunes" },
  { value: 2, label: "Martes" },
  { value: 3, label: "Miércoles" },
  { value: 4, label: "Jueves" },
  { value: 5, label: "Viernes" },
  { value: 6, label: "Sábado" },
  { value: 7, label: "Domingo" }
]

/** Regex compartida con el back para las horas `HH:mm`. */
export const HH_MM_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/

/**
 * Valida una zona IANA sin tocar el DOM. La captura de la zona del navegador
 * (`Intl…resolvedOptions`) vive en el hook, no en `core` (SPEC 20).
 */
export function isValidIanaTimezone(value: string): boolean {
  if (value.trim().length === 0) return false

  try {
    new Intl.DateTimeFormat("en-US", { timeZone: value })
    return true
  } catch {
    return false
  }
}

export function getFrequencyLabel(frequency: ReminderFrequency): string {
  return (
    REMINDER_FREQUENCY_OPTIONS.find((option) => option.value === frequency)
      ?.label ?? frequency
  )
}

export function getWeekdayLabel(weekday: number | null): string {
  if (weekday === null) return "—"
  return WEEKDAY_OPTIONS.find((option) => option.value === weekday)?.label ?? "—"
}
