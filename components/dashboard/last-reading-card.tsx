import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { getCategoryPresentation } from "@/lib/readings/categories"
import type { BPReading } from "@/lib/readings/types"
import { CalendarClock, HeartPulse } from "lucide-react"

interface LastReadingCardProps {
  reading: BPReading
}

const dateFormatter = new Intl.DateTimeFormat("es-ES", {
  dateStyle: "medium",
  timeStyle: "short"
})

/**
 * KPI de "Última medición". Es un dato directo del back (la lectura más
 * reciente), sin agregaciones: valores, categoría, pulso y fecha tal cual.
 */
export function LastReadingCard({ reading }: Readonly<LastReadingCardProps>) {
  const category = getCategoryPresentation(reading.category)

  return (
    <Card className="p-card">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-fg">
          Última medición
        </h2>
        <Badge tone={category.tone}>{category.label}</Badge>
      </div>

      <div className="mt-5 flex flex-wrap items-end gap-x-6 gap-y-3">
        <p className="flex items-baseline gap-1.5">
          <span className="text-3xl font-extrabold text-fg">
            {reading.systolic}
          </span>
          <span className="text-lg text-fg-subtle">/</span>
          <span className="text-2xl font-bold text-fg">
            {reading.diastolic}
          </span>
          <span className="ml-0.5 text-xs text-fg-muted">mmHg</span>
        </p>

        {reading.pulse !== null ? (
          <p className="flex items-center gap-1.5 text-sm font-semibold text-fg">
            <HeartPulse className="size-4 text-tone-purple" aria-hidden />
            {reading.pulse}
            <span className="text-xs font-normal text-fg-muted">BPM</span>
          </p>
        ) : null}
      </div>

      <p className="mt-4 flex items-center gap-1.5 text-xs text-fg-muted">
        <CalendarClock className="size-3.5" aria-hidden />
        <time dateTime={reading.timestamp}>
          {dateFormatter.format(new Date(reading.timestamp))}
        </time>
      </p>
    </Card>
  )
}
