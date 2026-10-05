import { ButtonLink } from "@/components/ui/button-link"
import { Card } from "@/components/ui/card"
import { ChartColumn } from "lucide-react"

/**
 * CTA del dashboard Premium hacia la pantalla de Análisis. Es puramente
 * presentacional: no calcula nada, solo invita a entrar.
 */
export function AnalyticsCtaCard() {
  return (
    <Card className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-purple-500/30 bg-purple-600/20 text-purple-300">
          <ChartColumn className="size-5" aria-hidden />
        </span>
        <div>
          <h2 className="text-sm font-semibold text-slate-100">
            Análisis avanzado
          </h2>
          <p className="mt-0.5 text-xs text-slate-400">
            Explora tendencias, promedios por periodo y tu distribución por
            categoría.
          </p>
        </div>
      </div>
      <ButtonLink href="/dashboard/analytics" className="shrink-0">
        Ver análisis
      </ButtonLink>
    </Card>
  )
}
