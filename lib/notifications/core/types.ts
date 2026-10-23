/**
 * Contrato de preferencias de notificación (SPEC 20).
 *
 * Vive en la capa portable `lib/…/core/` (SPEC 17): no importa Next ni toca el
 * DOM, de modo que la futura app Expo pueda reutilizarlo.
 */

export type ReminderFrequency = "DAILY" | "TWICE_DAILY" | "WEEKLY"

export interface NotificationPreferences {
  timezone: string
  remindersEnabled: boolean
  reminderFrequency: ReminderFrequency
  reminderTime: string
  reminderSecondTime: string | null
  reminderWeekday: number | null
  medicalAlertsEnabled: boolean
  alertHighEnabled: boolean
  alertLowEnabled: boolean
  alertIrregularEnabled: boolean
  weeklyReportEnabled: boolean
  monthlyReportEnabled: boolean
  reportByEmail: boolean
  reportInApp: boolean
  channelEmail: boolean
  channelPush: boolean
  channelInApp: boolean
}

/** `GET /notifications/preferences` */
export interface NotificationPreferencesResponse {
  preferences: NotificationPreferences
}

/** `PATCH /notifications/preferences` */
export interface UpdateNotificationPreferencesResponse {
  message: string
  preferences: NotificationPreferences
}

export type UpdateNotificationPreferencesInput =
  Partial<NotificationPreferences>
