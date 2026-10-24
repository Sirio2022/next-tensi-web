"use client"

import { Switch } from "@/components/ui/switch"
import type { NotificationPreferencesFormValues } from "@/lib/notifications/core/schemas"
import { Mail } from "lucide-react"
import { NotificationCard } from "./notification-card"

interface ReportsCardProps {
  values: NotificationPreferencesFormValues
  disabled: boolean
  onChange: (patch: Partial<NotificationPreferencesFormValues>) => void
}

/** Reportes Automáticos (SPEC 20). */
export function ReportsCard({
  values,
  disabled,
  onChange
}: Readonly<ReportsCardProps>) {
  const emailBlocked = !values.channelEmail

  return (
    <NotificationCard
      title="Reportes Automáticos"
      description="Recibe resúmenes periódicos de tus mediciones"
      icon={Mail}
      iconClassName="size-4 text-accent-text"
    >
      <div className="grid grid-cols-1 gap-x-8 gap-y-4 pt-1 sm:grid-cols-2">
        <Switch
          id="notifications-weekly-report"
          checked={values.weeklyReportEnabled}
          onCheckedChange={(checked) =>
            onChange({ weeklyReportEnabled: checked })
          }
          label="Reporte semanal"
          description="Resumen de la semana anterior, cada lunes."
          disabled={disabled || emailBlocked}
          tone="success"
        />
        <Switch
          id="notifications-monthly-report"
          checked={values.monthlyReportEnabled}
          onCheckedChange={(checked) =>
            onChange({ monthlyReportEnabled: checked })
          }
          label="Reporte mensual"
          description="Resumen del mes anterior, el día 1."
          disabled={disabled || emailBlocked}
          tone="success"
        />
        <Switch
          id="notifications-report-email"
          checked={values.reportByEmail}
          onCheckedChange={(checked) => onChange({ reportByEmail: checked })}
          label="Por email"
          description="Envía el reporte con el PDF adjunto."
          note={
            emailBlocked
              ? "Activa el canal Email para recibir reportes."
              : undefined
          }
          disabled={disabled || emailBlocked}
        />
        <Switch
          id="notifications-report-in-app"
          checked={values.reportInApp}
          onCheckedChange={(checked) => onChange({ reportInApp: checked })}
          label="En la app"
          description="Guarda la preferencia para la futura bandeja interna."
          note="Disponible próximamente"
          disabled={disabled}
        />
      </div>

      {emailBlocked ? (
        <p className="text-[10px] text-fg-subtle">
          El canal Email está apagado; los reportes no se enviarán hasta que lo
          actives.
        </p>
      ) : null}
    </NotificationCard>
  )
}
