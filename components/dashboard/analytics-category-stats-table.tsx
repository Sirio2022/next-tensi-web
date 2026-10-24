import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { orderCategoryStats } from "@/lib/readings/analytics"
import type { CategoryStat } from "@/lib/readings/analytics-types"
import { getCategoryPresentation } from "@/lib/readings/categories"

interface AnalyticsCategoryStatsTableProps {
  stats: readonly CategoryStat[]
}

const dateFormatter = new Intl.DateTimeFormat("es-ES", {
  dateStyle: "medium"
})

/**
 * Tabla de stats por categoría: conteo, promedio sistólica/diastólica y última
 * lectura. Los valores vienen del back (`GET /analytics/stats`); el front solo
 * los ordena por el orden canónico de categorías.
 */
export function AnalyticsCategoryStatsTable({
  stats
}: Readonly<AnalyticsCategoryStatsTableProps>) {
  const ordered = orderCategoryStats(stats)

  return (
    <Card className="space-y-4 p-card">
      <div>
        <h2 className="text-sm font-semibold text-fg">
          Detalle por categoría
        </h2>
        <p className="mt-0.5 text-xs text-fg-muted">
          Conteo, promedio y última lectura de cada categoría
        </p>
      </div>

      {ordered.length === 0 ? (
        <p className="text-sm text-fg-muted">
          Todavía no hay lecturas categorizadas.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <caption className="sr-only">
              Conteo, promedio y última lectura por categoría
            </caption>
            <thead>
              <tr className="text-fg-muted">
                <th scope="col" className="pb-3 pr-3 font-medium">
                  Categoría
                </th>
                <th scope="col" className="pb-3 pr-3 text-right font-medium">
                  Lecturas
                </th>
                <th scope="col" className="pb-3 pr-3 text-right font-medium">
                  Promedio
                </th>
                <th scope="col" className="pb-3 font-medium">
                  Última
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/80">
              {ordered.map((stat) => {
                const category = getCategoryPresentation(stat.category)

                return (
                  <tr key={stat.category}>
                    <th scope="row" className="py-row pr-3 font-normal">
                      <Badge tone={category.tone}>{category.label}</Badge>
                    </th>
                    <td className="py-row pr-3 text-right font-semibold text-fg">
                      {stat.count}
                    </td>
                    <td className="py-row pr-3 text-right whitespace-nowrap text-fg-muted">
                      {stat.avgSystolic} / {stat.avgDiastolic}{" "}
                      <span className="text-fg-subtle">mmHg</span>
                    </td>
                    <td className="py-row text-fg-muted">
                      <time dateTime={stat.lastReading}>
                        {dateFormatter.format(new Date(stat.lastReading))}
                      </time>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}
