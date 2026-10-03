import { Card } from "@/components/ui/card"
import type { ReadingMetric } from "@/lib/dashboard/reading-form"

interface MetricSliderProps {
  metric: ReadingMetric
  value: number
  onValueChange: (value: number) => void
}

/**
 * Tarjeta de una métrica: valor con unidad, slider nativo con acento por prop y
 * etiquetas min/max. Puramente presentacional: el estado lo gobierna el
 * formulario (`new-reading-form.tsx`).
 */
export function MetricSlider({
  metric,
  value,
  onValueChange
}: Readonly<MetricSliderProps>) {
  const inputId = `reading-${metric.id}`

  return (
    <Card className="space-y-4 p-5">
      <div className="text-center">
        <label
          htmlFor={inputId}
          className="text-xs font-medium tracking-wider text-slate-400 uppercase"
        >
          {metric.label}
        </label>
        <div className="mt-1 flex items-baseline justify-center gap-1">
          <output
            htmlFor={inputId}
            className={`text-3xl font-bold ${metric.accentClassName}`}
          >
            {value}
          </output>
          <span className="text-xs text-slate-500">{metric.unit}</span>
        </div>
      </div>

      <input
        id={inputId}
        type="range"
        min={metric.min}
        max={metric.max}
        value={value}
        onChange={(event) => onValueChange(Number(event.target.value))}
        className={`w-full cursor-pointer ${metric.accentClassName}`}
      />

      <div className="flex justify-between text-[11px] font-medium text-slate-500">
        <span>{metric.min}</span>
        <span>{metric.max}</span>
      </div>
    </Card>
  )
}
