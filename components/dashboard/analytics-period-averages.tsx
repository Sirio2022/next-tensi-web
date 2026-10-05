"use client"

import { Card } from "@/components/ui/card"
import { buildAveragePoints, getPeriodLabel } from "@/lib/readings/analytics"
import type {
  AnalyticsPeriod,
  PeriodAverage
} from "@/lib/readings/analytics-types"
import type { ReactNode } from "react"
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

interface AnalyticsPeriodAveragesProps {
  period: AnalyticsPeriod
  averages: readonly PeriodAverage[]
  /** Slot a la derecha del título (p. ej. el selector de granularidad). */
  actions?: ReactNode
}

const SYSTOLIC_COLOR = "#fb7185"
const DIASTOLIC_COLOR = "#38bdf8"

const AXIS_COLOR = "#64748b"
const GRID_COLOR = "#1e293b"

/**
 * Promedios por periodo (semanal / mensual / anual). Client component (Recharts
 * monta SVG): recibe el periodo activo y los promedios crudos del back y solo
 * los uniforma con `buildAveragePoints()`. Incluye alternativa textual con
 * `figure`/`figcaption`/`role="img"` y una tabla `sr-only`.
 */
export function AnalyticsPeriodAverages({
  period,
  averages,
  actions
}: Readonly<AnalyticsPeriodAveragesProps>) {
  const points = buildAveragePoints(period, averages)
  const label = getPeriodLabel(period)

  const header = (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 className="text-sm font-semibold text-slate-100">
          Promedios por periodo
        </h2>
        <p className="mt-0.5 text-xs text-slate-400">
          {label} ·{" "}
          {points.length === 0
            ? "sin datos todavía"
            : `${points.length} ${points.length === 1 ? "punto" : "puntos"}`}
        </p>
      </div>
      {actions}
    </div>
  )

  if (points.length === 0) {
    return (
      <Card className="space-y-4 p-6">
        {header}
        <p className="text-sm text-slate-400">
          Registra mediciones para ver tus promedios {label.toLowerCase()}es.
        </p>
      </Card>
    )
  }

  const description = `Gráfica de promedios ${label.toLowerCase()}es de presión arterial sistólica y diastólica.`

  return (
    <Card className="space-y-4 p-6">
      {header}

      {/* La gráfica no tiene tag nativo; role="img" + aria-label es el patrón accesible correcto. */}
      {/* eslint-disable-next-line jsx-a11y/prefer-tag-over-role */}
      <figure role="img" aria-label={description} className="m-0">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart
            data={points}
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
              domain={["dataMin - 10", "dataMax + 10"]}
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
              formatter={(value, name) => [`${String(value)} mmHg`, String(name)]}
            />
            <Legend wrapperStyle={{ fontSize: "0.75rem" }} />
            <Bar
              dataKey="avgSystolic"
              name="Sistólica"
              fill={SYSTOLIC_COLOR}
              radius={[4, 4, 0, 0]}
              isAnimationActive={false}
            />
            <Bar
              dataKey="avgDiastolic"
              name="Diastólica"
              fill={DIASTOLIC_COLOR}
              radius={[4, 4, 0, 0]}
              isAnimationActive={false}
            />
          </BarChart>
        </ResponsiveContainer>

        <figcaption className="mt-3 text-center text-xs text-slate-400">
          Promedio de sistólica y diastólica por {label.toLowerCase()} en mmHg.
        </figcaption>
      </figure>

      <table className="sr-only">
        <caption>Promedios de presión arterial por {label.toLowerCase()}</caption>
        <thead>
          <tr>
            <th scope="col">Periodo</th>
            <th scope="col">Sistólica (mmHg)</th>
            <th scope="col">Diastólica (mmHg)</th>
          </tr>
        </thead>
        <tbody>
          {points.map((point) => (
            <tr key={point.label}>
              <th scope="row">{point.label}</th>
              <td>{point.avgSystolic}</td>
              <td>{point.avgDiastolic}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  )
}
