import { Card } from "@/components/ui/card"
import { formatWeeklyChange } from "@/lib/readings/analytics"
import type {
  WeeklySummary,
  WeeklySummaryPoint
} from "@/lib/readings/analytics-types"

interface AnalyticsWeeklyKpisProps {
  summary: WeeklySummary
}

const dateFormatter = new Intl.DateTimeFormat("es-ES", {
  day: "2-digit",
  month: "short"
})

const CHANGE_TONE: Record<"up" | "down" | "flat", string> = {
  up: "text-amber-400",
  down: "text-emerald-400",
  flat: "text-slate-400"
}

function ReadingValue({
  reading,
  className
}: Readonly<{ reading: WeeklySummaryPoint; className: string }>) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span className={`text-3xl font-extrabold ${className}`}>
        {reading.systolic} / {reading.diastolic}
      </span>
      <span className="text-xs text-slate-400">mmHg</span>
    </div>
  )
}

function RegisteredAt({ timestamp }: Readonly<{ timestamp: string }>) {
  return (
    <p className="mt-3 text-[11px] text-slate-400">
      Registrado el{" "}
      <time dateTime={timestamp}>
        {dateFormatter.format(new Date(timestamp))}
      </time>
    </p>
  )
}

/**
 * KPIs de los últimos 7 días: pico más alto, mínima y promedio semanal con su
 * variación. El back calcula los valores (`GET /analytics/weekly-summary`); el
 * front solo formatea la flecha y el `±N %`.
 *
 * Devuelve las tres tarjetas sin envoltorio para que el contenedor decida la
 * grilla (3 columnas en Análisis, 4 junto a la última medición en el dashboard).
 */
export function AnalyticsWeeklyKpis({
  summary
}: Readonly<AnalyticsWeeklyKpisProps>) {
  const change = formatWeeklyChange(summary.changePercent)

  return (
    <>
      <Card className="p-5">
        <span className="mb-3 block text-xs font-medium tracking-wider text-slate-400 uppercase">
          Pico más alto (7 días)
        </span>
        {summary.peak ? (
          <>
            <ReadingValue reading={summary.peak} className="text-amber-400" />
            <RegisteredAt timestamp={summary.peak.timestamp} />
          </>
        ) : (
          <p className="text-sm text-slate-400">
            Sin lecturas en los últimos 7 días.
          </p>
        )}
      </Card>

      <Card className="p-5">
        <span className="mb-3 block text-xs font-medium tracking-wider text-slate-400 uppercase">
          Mínima (7 días)
        </span>
        {summary.lowest ? (
          <>
            <ReadingValue reading={summary.lowest} className="text-sky-400" />
            <RegisteredAt timestamp={summary.lowest.timestamp} />
          </>
        ) : (
          <p className="text-sm text-slate-400">
            Sin lecturas en los últimos 7 días.
          </p>
        )}
      </Card>

      <Card className="p-5">
        <span className="mb-3 block text-xs font-medium tracking-wider text-slate-400 uppercase">
          Promedio semanal
        </span>
        {summary.average ? (
          <>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-white">
                {summary.average.systolic} / {summary.average.diastolic}
              </span>
              <span className="text-xs text-slate-400">mmHg</span>
            </div>
            <p
              className={`mt-3 text-[11px] ${
                change ? CHANGE_TONE[change.direction] : "text-slate-400"
              }`}
            >
              {change
                ? `${change.text} respecto a la semana previa`
                : "Sin base de comparación"}
            </p>
          </>
        ) : (
          <p className="text-sm text-slate-400">
            Sin lecturas en los últimos 7 días.
          </p>
        )}
      </Card>
    </>
  )
}
