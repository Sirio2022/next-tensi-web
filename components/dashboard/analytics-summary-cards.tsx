import { Card } from "@/components/ui/card"
import type { AnalyticsSummary } from "@/lib/readings/analytics-types"

interface AnalyticsSummaryCardsProps {
  summary: AnalyticsSummary
}

/**
 * Resumen general de las analíticas: total de lecturas y promedios de sistólica,
 * diastólica y pulso. Todos los valores vienen tal cual del back
 * (`GET /bp-readings/analytics`); el front solo los presenta.
 */
export function AnalyticsSummaryCards({
  summary
}: Readonly<AnalyticsSummaryCardsProps>) {
  const pulse = summary.averages.pulse

  const metrics = [
    {
      label: "Total de lecturas",
      value: String(summary.totalReadings),
      unit: null,
      hint: "Registradas en tu historial",
      valueClassName: "text-white"
    },
    {
      label: "Promedio sistólica",
      value: String(summary.averages.systolic),
      unit: "mmHg",
      hint: "Media de todas tus lecturas",
      valueClassName: "text-rose-400"
    },
    {
      label: "Promedio diastólica",
      value: String(summary.averages.diastolic),
      unit: "mmHg",
      hint: "Media de todas tus lecturas",
      valueClassName: "text-sky-400"
    },
    {
      label: "Pulso promedio",
      value: pulse === null ? "—" : String(pulse),
      unit: pulse === null ? null : "BPM",
      hint: pulse === null ? "Sin lecturas con pulso" : "Solo lecturas con pulso",
      valueClassName: "text-purple-400"
    }
  ] as const

  return (
    <section
      aria-label="Resumen general"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      {metrics.map((metric) => (
        <Card key={metric.label} className="p-5">
          <p className="text-xs font-medium tracking-wider text-slate-400 uppercase">
            {metric.label}
          </p>
          <p className="mt-3 flex items-baseline gap-1.5">
            <span className={`text-3xl font-extrabold ${metric.valueClassName}`}>
              {metric.value}
            </span>
            {metric.unit ? (
              <span className="text-xs text-slate-400">{metric.unit}</span>
            ) : null}
          </p>
          <p className="mt-2 text-[11px] text-slate-400">{metric.hint}</p>
        </Card>
      ))}
    </section>
  )
}
