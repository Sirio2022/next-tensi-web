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
  up: "text-tone-amber",
  down: "text-tone-emerald",
  flat: "text-fg-muted"
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
      <span className="text-xs text-fg-muted">mmHg</span>
    </div>
  )
}

function RegisteredAt({ timestamp }: Readonly<{ timestamp: string }>) {
  return (
    <p className="mt-3 text-[11px] text-fg-muted">
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
      <Card className="p-card">
        <span className="mb-3 block text-xs font-medium tracking-wider text-fg-muted uppercase">
          Pico más alto (7 días)
        </span>
        {summary.peak ? (
          <>
            <ReadingValue reading={summary.peak} className="text-tone-amber" />
            <RegisteredAt timestamp={summary.peak.timestamp} />
          </>
        ) : (
          <p className="text-sm text-fg-muted">
            Sin lecturas en los últimos 7 días.
          </p>
        )}
      </Card>

      <Card className="p-card">
        <span className="mb-3 block text-xs font-medium tracking-wider text-fg-muted uppercase">
          Mínima (7 días)
        </span>
        {summary.lowest ? (
          <>
            <ReadingValue reading={summary.lowest} className="text-tone-sky" />
            <RegisteredAt timestamp={summary.lowest.timestamp} />
          </>
        ) : (
          <p className="text-sm text-fg-muted">
            Sin lecturas en los últimos 7 días.
          </p>
        )}
      </Card>

      <Card className="p-card">
        <span className="mb-3 block text-xs font-medium tracking-wider text-fg-muted uppercase">
          Promedio semanal
        </span>
        {summary.average ? (
          <>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-fg">
                {summary.average.systolic} / {summary.average.diastolic}
              </span>
              <span className="text-xs text-fg-muted">mmHg</span>
            </div>
            <p
              className={`mt-3 text-[11px] ${
                change ? CHANGE_TONE[change.direction] : "text-fg-muted"
              }`}
            >
              {change
                ? `${change.text} respecto a la semana previa`
                : "Sin base de comparación"}
            </p>
          </>
        ) : (
          <p className="text-sm text-fg-muted">
            Sin lecturas en los últimos 7 días.
          </p>
        )}
      </Card>
    </>
  )
}
