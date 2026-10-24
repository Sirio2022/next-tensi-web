"use client"

import { Switch } from "@/components/ui/switch"
import {
  REMINDER_FREQUENCY_OPTIONS,
  WEEKDAY_OPTIONS
} from "@/lib/notifications/core/preferences"
import type { NotificationPreferencesFormValues } from "@/lib/notifications/core/schemas"
import type { ReminderFrequency } from "@/lib/notifications/core/types"
import { Clock } from "lucide-react"
import { NotificationCard } from "./notification-card"

interface RemindersCardProps {
  values: NotificationPreferencesFormValues
  errors: Partial<Record<keyof NotificationPreferencesFormValues, string>>
  disabled: boolean
  onChange: (patch: Partial<NotificationPreferencesFormValues>) => void
}

const FIELD_CLASSES =
  "w-full rounded-xl border border-line bg-surface/80 px-3 py-2 text-xs text-fg transition focus:border-accent focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"

const LABEL_CLASSES =
  "mb-1.5 block text-[10px] font-bold tracking-wider text-fg-muted uppercase"

/** Recordatorios de Medición (SPEC 20). */
export function RemindersCard({
  values,
  errors,
  disabled,
  onChange
}: Readonly<RemindersCardProps>) {
  const emailDisabled = !values.channelEmail
  const isTwiceDaily = values.reminderFrequency === "TWICE_DAILY"
  const isWeekly = values.reminderFrequency === "WEEKLY"

  return (
    <NotificationCard
      title="Recordatorios de Medición"
      description="Te ayudamos a mantener un control regular de tu presión arterial"
      icon={Clock}
      iconClassName="size-4 text-accent-text"
    >
      <Switch
        id="notifications-reminders-enabled"
        checked={values.remindersEnabled}
        onCheckedChange={(checked) => onChange({ remindersEnabled: checked })}
        label="Activar recordatorios"
        description="Un aviso por email cuando no hayas registrado una medición"
        note={
          emailDisabled
            ? "Activa el canal Email para recibir recordatorios."
            : undefined
        }
        disabled={disabled || emailDisabled}
      />

      <div className="grid grid-cols-1 gap-4 pt-1 sm:grid-cols-2">
        <div>
          <label htmlFor="notifications-reminder-frequency" className={LABEL_CLASSES}>
            Frecuencia
          </label>
          <select
            id="notifications-reminder-frequency"
            value={values.reminderFrequency}
            disabled={disabled}
            onChange={(event) =>
              onChange({
                reminderFrequency: event.target.value as ReminderFrequency
              })
            }
            className={FIELD_CLASSES}
          >
            {REMINDER_FREQUENCY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="notifications-reminder-time" className={LABEL_CLASSES}>
            Hora preferida
          </label>
          <input
            id="notifications-reminder-time"
            type="time"
            required
            value={values.reminderTime}
            disabled={disabled}
            aria-invalid={Boolean(errors.reminderTime)}
            aria-describedby={
              errors.reminderTime ? "notifications-reminder-time-error" : undefined
            }
            onChange={(event) =>
              onChange({ reminderTime: event.target.value })
            }
            className={FIELD_CLASSES}
          />
          {errors.reminderTime ? (
            <p
              id="notifications-reminder-time-error"
              className="mt-1 text-[10px] text-tone-rose"
            >
              {errors.reminderTime}
            </p>
          ) : null}
        </div>

        {isTwiceDaily ? (
          <div>
            <label
              htmlFor="notifications-reminder-second-time"
              className={LABEL_CLASSES}
            >
              Segunda hora
            </label>
            <input
              id="notifications-reminder-second-time"
              type="time"
              required
              value={values.reminderSecondTime ?? ""}
              disabled={disabled}
              aria-invalid={Boolean(errors.reminderSecondTime)}
              aria-describedby={
                errors.reminderSecondTime
                  ? "notifications-reminder-second-time-error"
                  : undefined
              }
              onChange={(event) =>
                onChange({
                  reminderSecondTime: event.target.value || null
                })
              }
              className={FIELD_CLASSES}
            />
            {errors.reminderSecondTime ? (
              <p
                id="notifications-reminder-second-time-error"
                className="mt-1 text-[10px] text-tone-rose"
              >
                {errors.reminderSecondTime}
              </p>
            ) : null}
          </div>
        ) : null}

        {isWeekly ? (
          <div>
            <label
              htmlFor="notifications-reminder-weekday"
              className={LABEL_CLASSES}
            >
              Día de la semana
            </label>
            <select
              id="notifications-reminder-weekday"
              required
              value={values.reminderWeekday ?? ""}
              disabled={disabled}
              aria-invalid={Boolean(errors.reminderWeekday)}
              aria-describedby={
                errors.reminderWeekday
                  ? "notifications-reminder-weekday-error"
                  : undefined
              }
              onChange={(event) =>
                onChange({
                  reminderWeekday:
                    event.target.value === ""
                      ? null
                      : Number(event.target.value)
                })
              }
              className={FIELD_CLASSES}
            >
              <option value="">Elige un día</option>
              {WEEKDAY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.reminderWeekday ? (
              <p
                id="notifications-reminder-weekday-error"
                className="mt-1 text-[10px] text-tone-rose"
              >
                {errors.reminderWeekday}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
    </NotificationCard>
  )
}
