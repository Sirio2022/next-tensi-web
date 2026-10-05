import { buildAnalyticsHref } from "@/lib/readings/analytics"
import type {
  AnalyticsPeriod,
  AnalyticsRange
} from "@/lib/readings/analytics-types"
import Link from "next/link"

interface AnalyticsRangeToggleProps {
  range: AnalyticsRange
  /** Se preserva en los enlaces para no perder el otro eje de filtro. */
  period: AnalyticsPeriod
}

const RANGE_OPTIONS: readonly { value: AnalyticsRange; label: string }[] = [
  { value: "7d", label: "7 días" },
  { value: "30d", label: "30 días" }
]

/**
 * Selector del rango de la gráfica de tendencia. Sin estado: son enlaces a la
 * misma página con `?range=`, y el activo lleva `aria-current`.
 */
export function AnalyticsRangeToggle({
  range,
  period
}: Readonly<AnalyticsRangeToggleProps>) {
  return (
    <nav
      aria-label="Rango de la tendencia"
      className="inline-flex rounded-xl border border-slate-800 bg-slate-950/60 p-1"
    >
      {RANGE_OPTIONS.map((option) => {
        const isActive = option.value === range

        return (
          <Link
            key={option.value}
            href={buildAnalyticsHref({ range: option.value, period })}
            aria-current={isActive ? "true" : undefined}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all focus-visible:ring-2 focus-visible:ring-tensi-400/70 focus-visible:outline-none ${
              isActive
                ? "bg-slate-800 text-white"
                : "text-slate-400 hover:text-slate-100"
            }`}
          >
            {option.label}
          </Link>
        )
      })}
    </nav>
  )
}
