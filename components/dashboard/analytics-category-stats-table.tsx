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
    <Card className="space-y-4 p-6">
      <div>
        <h2 className="text-sm font-semibold text-slate-100">
          Detalle por categoría
        </h2>
        <p className="mt-0.5 text-xs text-slate-400">
          Conteo, promedio y última lectura de cada categoría
        </p>
      </div>

      {ordered.length === 0 ? (
        <p className="text-sm text-slate-400">
          Todavía no hay lecturas categorizadas.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <caption className="sr-only">
              Conteo, promedio y última lectura por categoría
            </caption>
            <thead>
              <tr className="text-slate-400">
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
            <tbody className="divide-y divide-slate-800/80">
              {ordered.map((stat) => {
                const category = getCategoryPresentation(stat.category)

                return (
                  <tr key={stat.category}>
                    <th scope="row" className="py-3 pr-3 font-normal">
                      <Badge tone={category.tone}>{category.label}</Badge>
                    </th>
                    <td className="py-3 pr-3 text-right font-semibold text-slate-200">
                      {stat.count}
                    </td>
                    <td className="py-3 pr-3 text-right whitespace-nowrap text-slate-300">
                      {stat.avgSystolic} / {stat.avgDiastolic}{" "}
                      <span className="text-slate-500">mmHg</span>
                    </td>
                    <td className="py-3 text-slate-400">
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
