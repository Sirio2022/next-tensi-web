import { buildAnalyticsHref } from "@/lib/readings/analytics"
import type {
  AnalyticsPeriod,
  AnalyticsRange
} from "@/lib/readings/analytics-types"
import Link from "next/link"

interface AnalyticsPeriodToggleProps {
  period: AnalyticsPeriod
  /** Se preserva en los enlaces para no perder el otro eje de filtro. */
  range: AnalyticsRange
}

const PERIOD_OPTIONS: readonly { value: AnalyticsPeriod; label: string }[] = [
  { value: "weekly", label: "Semanal" },
  { value: "monthly", label: "Mensual" },
  { value: "yearly", label: "Anual" }
]

/**
 * Selector de la granularidad de los promedios. Sin estado: son enlaces a la
 * misma página con `?period=`, y el activo lleva `aria-current`.
 */
export function AnalyticsPeriodToggle({
  period,
  range
}: Readonly<AnalyticsPeriodToggleProps>) {
  return (
    <nav
      aria-label="Granularidad de los promedios"
      className="inline-flex rounded-xl border border-line bg-surface/60 p-1"
    >
      {PERIOD_OPTIONS.map((option) => {
        const isActive = option.value === period

        return (
          <Link
            key={option.value}
            href={buildAnalyticsHref({ range, period: option.value })}
            aria-current={isActive ? "true" : undefined}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all focus-visible:ring-2 focus-visible:ring-focus/70 focus-visible:outline-none ${
              isActive
                ? "bg-accent-soft text-accent-text"
                : "text-fg-muted hover:text-fg"
            }`}
          >
            {option.label}
          </Link>
        )
      })}
    </nav>
  )
}
