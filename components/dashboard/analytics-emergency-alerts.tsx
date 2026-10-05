import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import type { EmergencyReadingAlert } from "@/lib/readings/analytics-types"
import { TriangleAlert } from "lucide-react"

interface AnalyticsEmergencyAlertsProps {
  count: number
  alerts: readonly EmergencyReadingAlert[]
}

const dateFormatter = new Intl.DateTimeFormat("es-ES", {
  dateStyle: "medium",
  timeStyle: "short"
})

/**
 * Detalle de emergencias: total de lecturas críticas y la lista con valores,
 * fecha y notas. El back identifica las crisis (`GET /analytics`); el front no
 * recalcula nada.
 */
export function AnalyticsEmergencyAlerts({
  count,
  alerts
}: Readonly<AnalyticsEmergencyAlertsProps>) {
  return (
    <Card className="space-y-4 p-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <TriangleAlert className="size-4 text-rose-400" aria-hidden />
          <h2 className="text-sm font-semibold text-slate-100">
            Emergencias registradas
          </h2>
        </div>
        <Badge tone={count > 0 ? "rose" : "neutral"}>{count}</Badge>
      </div>

      {alerts.length === 0 ? (
        <p className="text-sm text-slate-400">
          No hay lecturas en rango de crisis en tu historial.
        </p>
      ) : (
        <ul className="space-y-3">
          {alerts.map((alert) => (
            <li
              key={alert.id}
              className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-bold text-rose-200">
                  {alert.systolic} / {alert.diastolic}{" "}
                  <span className="text-xs font-normal text-slate-400">
                    mmHg
                  </span>
                </span>
                <time
                  dateTime={alert.timestamp}
                  className="text-[11px] text-slate-400"
                >
                  {dateFormatter.format(new Date(alert.timestamp))}
                </time>
              </div>
              {alert.notes ? (
                <p className="mt-2 text-xs/relaxed text-slate-300">
                  {alert.notes}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
