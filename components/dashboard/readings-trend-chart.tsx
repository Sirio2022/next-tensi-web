"use client"

import { Card } from "@/components/ui/card"
import { getCategoryPresentation } from "@/lib/readings/categories"
import type { BPReading } from "@/lib/readings/types"
import { useMemo } from "react"
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts"

interface ReadingsTrendChartProps {
  readings: readonly BPReading[]
}

interface TrendPoint {
  id: string
  label: string
  systolic: number
  diastolic: number
  category: BPReading["category"]
}

const SYSTOLIC_COLOR = "#fb7185"
const DIASTOLIC_COLOR = "#38bdf8"

const AXIS_COLOR = "#64748b"
const GRID_COLOR = "#1e293b"

const dateTimeFormatter = new Intl.DateTimeFormat("es-ES", {
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit"
})

/**
 * Gráfica de evolución del plan Free. Client component (Recharts monta SVG) que
 * recibe las lecturas crudas del Server Component. Solo muestra `systolic`,
 * `diastolic`, `timestamp` y `category` tal como llegan del back: no agrega ni
 * promedia nada. El orden se invierte a cronológico (el back las envía de más
 * reciente a más antigua) porque un eje temporal se lee de izquierda a derecha.
 *
 * Accesibilidad: la `figure` lleva `role="img"` + `aria-label` y una `figcaption`,
 * y una tabla `sr-only` con los mismos datos da la alternativa textual.
 */
export function ReadingsTrendChart({
  readings
}: Readonly<ReadingsTrendChartProps>) {
  const points = useMemo<TrendPoint[]>(
    () =>
      [...readings].reverse().map((reading) => ({
        id: reading.id,
        label: dateTimeFormatter.format(new Date(reading.timestamp)),
        systolic: reading.systolic,
        diastolic: reading.diastolic,
        category: reading.category
      })),
    [readings]
  )

  if (points.length === 0) return null

  const description = `Gráfica de evolución de ${points.length} mediciones de presión arterial sistólica y diastólica, en orden cronológico.`

  return (
    <Card className="space-y-4 p-6">
      <div>
        <h2 className="text-sm font-semibold text-slate-100">
          Evolución de tu presión
        </h2>
        <p className="mt-0.5 text-xs text-slate-400">
          Últimas {points.length} mediciones registradas
        </p>
      </div>

      {/* La gráfica no tiene tag nativo; role="img" + aria-label es el patrón accesible correcto. */}
      {/* eslint-disable-next-line jsx-a11y/prefer-tag-over-role */}
      <figure role="img" aria-label={description} className="m-0">
        <ResponsiveContainer width="100%" height={280}>
          <LineChart
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
              cursor={{ stroke: "#334155" }}
              contentStyle={{
                background: "#0f172a",
                border: "1px solid #1e293b",
                borderRadius: "0.75rem",
                fontSize: "0.75rem"
              }}
              labelStyle={{ color: "#e2e8f0" }}
              itemStyle={{ color: "#cbd5e1" }}
              labelFormatter={(label, payload) => {
                const point = payload?.[0]?.payload as TrendPoint | undefined
                if (!point) return label
                return `${label} · ${getCategoryPresentation(point.category).label}`
              }}
              formatter={(value, name) => [`${String(value)} mmHg`, String(name)]}
            />
            <Legend wrapperStyle={{ fontSize: "0.75rem" }} />
            <Line
              type="monotone"
              dataKey="systolic"
              name="Sistólica"
              stroke={SYSTOLIC_COLOR}
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="diastolic"
              name="Diastólica"
              stroke={DIASTOLIC_COLOR}
              strokeWidth={2}
              strokeDasharray="5 3"
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>

        <figcaption className="mt-3 text-center text-xs text-slate-400">
          Sistólica (línea continua) y diastólica (línea discontinua) en mmHg.
        </figcaption>
      </figure>

      <table className="sr-only">
        <caption>
          Valores de presión sistólica y diastólica por medición
        </caption>
        <thead>
          <tr>
            <th scope="col">Fecha y hora</th>
            <th scope="col">Sistólica (mmHg)</th>
            <th scope="col">Diastólica (mmHg)</th>
            <th scope="col">Categoría</th>
          </tr>
        </thead>
        <tbody>
          {points.map((point) => (
            <tr key={point.id}>
              <th scope="row">{point.label}</th>
              <td>{point.systolic}</td>
              <td>{point.diastolic}</td>
              <td>{getCategoryPresentation(point.category).label}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  )
}
