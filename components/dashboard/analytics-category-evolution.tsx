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

const AXIS_COLOR = "#64748b"
const GRID_COLOR = "#1e293b"

/**
 * Evolución mensual por categoría (barras apiladas). Client component (Recharts
 * monta SVG): recibe los puntos crudos del back y los agrupa por mes con
 * `buildEvolutionSeries()`, limitando las series a las categorías presentes.
 * Incluye alternativa textual con `figure`/`figcaption`/`role="img"` y tabla
 * `sr-only`.
 */
export function AnalyticsCategoryEvolution({
  points
}: Readonly<AnalyticsCategoryEvolutionProps>) {
  const series = buildEvolutionSeries(points)

  if (series.points.length === 0 || series.categories.length === 0) {
    return (
      <Card className="space-y-4 p-6">
        <div>
          <h2 className="text-sm font-semibold text-slate-100">
            Evolución por categoría
          </h2>
          <p className="mt-0.5 text-xs text-slate-400">
            Distribución mensual de tus lecturas
          </p>
        </div>
        <p className="text-sm text-slate-400">
          Todavía no hay meses con lecturas categorizadas.
        </p>
      </Card>
    )
  }

  const description = `Gráfica de evolución mensual de ${series.points.length} meses con lecturas agrupadas por categoría de presión arterial.`

  return (
    <Card className="space-y-4 p-6">
      <div>
        <h2 className="text-sm font-semibold text-slate-100">
          Evolución por categoría
        </h2>
        <p className="mt-0.5 text-xs text-slate-400">
          Lecturas por mes y categoría OMS
        </p>
      </div>

      {/* La gráfica no tiene tag nativo; role="img" + aria-label es el patrón accesible correcto. */}
      {/* eslint-disable-next-line jsx-a11y/prefer-tag-over-role */}
      <figure role="img" aria-label={description} className="m-0">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={series.points}
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
              cursor={{ fill: "#1e293b", fillOpacity: 0.4 }}
              contentStyle={{
                background: "#0f172a",
                border: "1px solid #1e293b",
                borderRadius: "0.75rem",
                fontSize: "0.75rem"
              }}
              labelStyle={{ color: "#e2e8f0" }}
              itemStyle={{ color: "#cbd5e1" }}
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

        <figcaption className="mt-3 text-center text-xs text-slate-400">
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
