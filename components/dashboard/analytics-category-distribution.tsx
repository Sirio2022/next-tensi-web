import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { buildCategorySeries, TONE_HEX } from "@/lib/readings/analytics"
import type { BloodPressureCategory } from "@/lib/readings/types"

interface AnalyticsCategoryDistributionProps {
  distribution: Partial<Record<BloodPressureCategory, number>>
}

/**
 * Distribución de lecturas por categoría OMS. Cada fila lleva label, conteo y
 * porcentaje visibles, así que la lectura no depende solo del color. La barra es
 * decorativa (`aria-hidden`).
 */
export function AnalyticsCategoryDistribution({
  distribution
}: Readonly<AnalyticsCategoryDistributionProps>) {
  const points = buildCategorySeries(distribution)
  const total = points.reduce((acc, point) => acc + point.count, 0)
  const max = points.reduce((acc, point) => Math.max(acc, point.count), 0)

  return (
    <Card className="space-y-4 p-6">
      <div>
        <h2 className="text-sm font-semibold text-slate-100">
          Distribución por categoría
        </h2>
        <p className="mt-0.5 text-xs text-slate-400">
          {total} {total === 1 ? "lectura clasificada" : "lecturas clasificadas"}{" "}
          según la OMS
        </p>
      </div>

      {points.length === 0 ? (
        <p className="text-sm text-slate-400">
          Todavía no hay lecturas categorizadas.
        </p>
      ) : (
        <ul className="space-y-4">
          {points.map((point) => {
            const share = total > 0 ? Math.round((point.count / total) * 100) : 0
            const barWidth = max > 0 ? (point.count / max) * 100 : 0

            return (
              <li key={point.category} className="space-y-1.5">
                <div className="flex items-center justify-between gap-3">
                  <Badge tone={point.tone}>{point.label}</Badge>
                  <span className="text-xs font-semibold text-slate-200">
                    {point.count}
                    <span className="font-normal text-slate-500">
                      {" "}
                      · {share} %
                    </span>
                  </span>
                </div>
                <div
                  className="h-1.5 overflow-hidden rounded-full bg-slate-800"
                  aria-hidden="true"
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${barWidth}%`,
                      backgroundColor: TONE_HEX[point.tone]
                    }}
                  />
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </Card>
  )
}
