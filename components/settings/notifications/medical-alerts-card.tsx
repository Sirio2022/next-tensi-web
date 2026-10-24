"use client"

import { Switch } from "@/components/ui/switch"
import type { NotificationPreferencesFormValues } from "@/lib/notifications/core/schemas"
import { AlertTriangle } from "lucide-react"
import { NotificationCard } from "./notification-card"

interface MedicalAlertsCardProps {
  values: NotificationPreferencesFormValues
  disabled: boolean
  onChange: (patch: Partial<NotificationPreferencesFormValues>) => void
}

/** Alertas Médicas (SPEC 20). */
export function MedicalAlertsCard({
  values,
  disabled,
  onChange
}: Readonly<MedicalAlertsCardProps>) {
  const emailDisabled = !values.channelEmail
  const alertsDisabled = disabled || !values.medicalAlertsEnabled
  const subOptionsDisabled = alertsDisabled || emailDisabled

  const mainNote = emailDisabled
    ? "Activa el canal Email para recibir alertas médicas."
    : undefined

  return (
    <NotificationCard
      title="Alertas Médicas"
      description="Recibe alertas cuando tus valores requieran atención médica"
      icon={AlertTriangle}
      iconClassName="size-4 text-tone-rose"
    >
      <Switch
        id="notifications-medical-enabled"
        checked={values.medicalAlertsEnabled}
        onCheckedChange={(checked) =>
          onChange({ medicalAlertsEnabled: checked })
        }
        label="Activar alertas médicas"
        description="Recomendado para todos los usuarios"
        note={mainNote}
        disabled={disabled || emailDisabled}
        tone="danger"
      />

      <div className="space-y-3 border-l-2 border-line pt-1 pl-4">
        <Switch
          id="notifications-alert-high"
          checked={values.alertHighEnabled}
          onCheckedChange={(checked) => onChange({ alertHighEnabled: checked })}
          label="Presión arterial alta (>140/90)"
          description="Aviso inmediato al registrar una lectura por encima del umbral."
          disabled={subOptionsDisabled}
          tone="danger"
        />
        <Switch
          id="notifications-alert-low"
          checked={values.alertLowEnabled}
          onCheckedChange={(checked) => onChange({ alertLowEnabled: checked })}
          label="Presión arterial baja (<90/60)"
          description="Aviso inmediato al registrar una lectura por debajo del umbral."
          disabled={subOptionsDisabled}
          tone="danger"
        />
        <Switch
          id="notifications-alert-irregular"
          checked={values.alertIrregularEnabled}
          onCheckedChange={(checked) =>
            onChange({ alertIrregularEnabled: checked })
          }
          label="Patrones irregulares detectados"
          description="Aviso cuando el tensiómetro marca pulso irregular."
          disabled={subOptionsDisabled}
          tone="danger"
        />

        {!emailDisabled && !values.medicalAlertsEnabled ? (
          <p className="text-[10px] text-fg-subtle">
            Activa las alertas médicas para ajustar estos avisos.
          </p>
        ) : null}
      </div>
    </NotificationCard>
  )
}
