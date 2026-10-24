"use client"

import { Card } from "@/components/ui/card"
import { buildEvolutionSeries, TONE_HEX } from "@/lib/readings/analytics"
import type { CategoryDistributionPoint } from "@/lib/readings/analytics-types"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts"

interface AnalyticsCategoryEvolutionProps {
  points: readonly CategoryDistributionPoint[]
}

const AXIS_COLOR = "var(--color-chart-axis)"
const GRID_COLOR = "var(--color-chart-grid)"

/**
 * Evolución mensual por categoría (barras apiladas). Client component (Recharts
 * monta SVG): recibe los puntos crudos del back y los agrupa por mes con
 * `buildEvolutionSeries()`, limitando las series a las categorías presentes.
 * Aplana `counts` en cada punto para que Recharts lea el valor en la raíz (con
 * `dataKey={category.category}`; Recharts no resuelve rutas anidadas).
 * Incluye alternativa textual con `figure`/`figcaption`/`role="img"` y tabla
 * `sr-only`.
 */
export function AnalyticsCategoryEvolution({
  points
}: Readonly<AnalyticsCategoryEvolutionProps>) {
  const series = buildEvolutionSeries(points)

  if (series.points.length === 0 || series.categories.length === 0) {
    return (
      <Card className="space-y-4 p-card">
        <div>
          <h2 className="text-sm font-semibold text-fg">
            Evolución por categoría
          </h2>
          <p className="mt-0.5 text-xs text-fg-muted">
            Distribución mensual de tus lecturas
          </p>
        </div>
        <p className="text-sm text-fg-muted">
          Todavía no hay meses con lecturas categorizadas.
        </p>
      </Card>
    )
  }

  const chartData = series.points.map(({ label, counts }) => ({
    label,
    ...counts
  }))

  const description = `Gráfica de evolución mensual de ${series.points.length} meses con lecturas agrupadas por categoría de presión arterial.`

  return (
    <Card className="space-y-4 p-card">
      <div>
        <h2 className="text-sm font-semibold text-fg">
          Evolución por categoría
        </h2>
        <p className="mt-0.5 text-xs text-fg-muted">
          Lecturas por mes y categoría OMS
        </p>
      </div>

      {/* La gráfica no tiene tag nativo; role="img" + aria-label es el patrón accesible correcto. */}
      {/* eslint-disable-next-line jsx-a11y/prefer-tag-over-role */}
      <figure role="img" aria-label={description} className="m-0">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={chartData}
            margin={{ top: 8, right: 12, bottom: 0, left: -12 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
            <XAxis
              dataKey="label"
              stroke={AXIS_COLOR}
              tick={{ fontSize: 11 }}
              tickMargin={8}
            />
            <YAxis
              stroke={AXIS_COLOR}
              tick={{ fontSize: 11 }}
              width={44}
              allowDecimals={false}
            />
            <Tooltip
              cursor={{ fill: "var(--color-chart-grid)", fillOpacity: 0.4 }}
              contentStyle={{
                background: "var(--color-chart-tooltip)",
                border: "1px solid var(--color-chart-tooltip-line)",
                borderRadius: "0.75rem",
                fontSize: "0.75rem"
              }}
              labelStyle={{ color: "var(--color-fg)" }}
              itemStyle={{ color: "var(--color-fg-muted)" }}
              formatter={(value, name) => [String(value), String(name)]}
            />
            <Legend wrapperStyle={{ fontSize: "0.75rem" }} />
            {series.categories.map((category) => (
              <Bar
                key={category.category}
                dataKey={category.category}
                name={category.label}
                stackId="evolution"
                fill={TONE_HEX[category.tone]}
                isAnimationActive={false}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>

        <figcaption className="mt-3 text-center text-xs text-fg-muted">
          Cantidad de lecturas por mes agrupadas por categoría de presión
          arterial.
        </figcaption>
      </figure>

      <table className="sr-only">
        <caption>Lecturas por mes y categoría</caption>
        <thead>
          <tr>
            <th scope="col">Mes</th>
            {series.categories.map((category) => (
              <th key={category.category} scope="col">
                {category.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {series.points.map((point) => (
            <tr key={point.key}>
              <th scope="row">{point.label}</th>
              {series.categories.map((category) => (
                <td key={category.category}>
                  {point.counts[category.category] ?? 0}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  )
}
