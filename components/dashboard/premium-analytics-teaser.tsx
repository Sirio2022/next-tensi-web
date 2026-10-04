import { ButtonLink } from "@/components/ui/button-link"
import { Card } from "@/components/ui/card"
import { LockBadge } from "@/components/ui/lock-badge"
import { Activity, FileText, TrendingUp } from "lucide-react"
import type { ReactNode } from "react"

interface TeaserFeature {
  icon: ReactNode
  title: string
  description: string
}

const FEATURES: readonly TeaserFeature[] = [
  {
    icon: <Activity className="size-4" aria-hidden />,
    title: "Promedios semanales y mensuales",
    description: "Media de tus valores por periodo, calculada por Tensi."
  },
  {
    icon: <TrendingUp className="size-4" aria-hidden />,
    title: "Tendencias y distribución",
    description: "Evolución por categoría y patrones a lo largo del tiempo."
  },
  {
    icon: <FileText className="size-4" aria-hidden />,
    title: "Reportes PDF para tu médico",
    description: "Exportables en un clic para tus consultas."
  }
]

/**
 * Gancho Premium del dashboard Free: bloque estático difuminado con candado que
 * anuncia las analíticas avanzadas (promedios, tendencias y PDF). No calcula
 * nada: es puro escaparate con CTA de upgrade.
 */
export function PremiumAnalyticsTeaser() {
  return (
    <Card className="relative overflow-hidden p-6">
      <div
        className="pointer-events-none absolute -top-16 -right-16 size-48 rounded-full bg-purple-500/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative z-10 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-100">
              Analíticas avanzadas
            </h2>
            <p className="mt-0.5 text-xs text-slate-400">
              Disponibles con Tensi Premium
            </p>
          </div>
          <LockBadge />
        </div>

        <ul
          aria-hidden="true"
          className="pointer-events-none space-y-3 opacity-60 blur-[2px] select-none"
        >
          {FEATURES.map((feature) => (
            <li
              key={feature.title}
              className="flex items-center gap-3 rounded-xl border border-slate-800/80 bg-slate-950/60 p-3"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-purple-500/30 bg-purple-600/20 text-purple-400">
                {feature.icon}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs font-semibold text-slate-200">
                  {feature.title}
                </span>
                <span className="block truncate text-[11px] text-slate-400">
                  {feature.description}
                </span>
              </span>
              <span className="h-2 w-16 shrink-0 rounded-full bg-slate-800" />
            </li>
          ))}
        </ul>

        <div className="flex flex-col gap-3 rounded-xl border border-purple-500/20 bg-linear-to-r from-blue-950/60 to-purple-950/60 p-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-300">
            Desbloquea promedios, tendencias y reportes exportables.
          </p>
          <ButtonLink
            href="/dashboard#upgrade"
            tone="primary"
            size="sm"
            className="shrink-0 bg-purple-600 shadow-purple-600/25 hover:bg-purple-500"
          >
            Mejorar a Premium
          </ButtonLink>
        </div>
      </div>
    </Card>
  )
}
