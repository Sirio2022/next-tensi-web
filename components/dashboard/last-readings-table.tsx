import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { getCategoryPresentation } from "@/lib/readings/categories"
import type { BPReading } from "@/lib/readings/types"
import Link from "next/link"

interface LastReadingsTableProps {
  readings: readonly BPReading[]
}

const dateFormatter = new Intl.DateTimeFormat("es-ES", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit"
})

/**
 * Lista compacta de las últimas lecturas del dashboard Premium, con enlace al
 * Historial. Los valores y la categoría vienen tal cual del back
 * (`GET /bp-readings?limit=5`).
 */
export function LastReadingsTable({
  readings
}: Readonly<LastReadingsTableProps>) {
  return (
    <Card className="space-y-4 p-card">
      <h2 className="text-sm font-semibold text-fg">Últimas lecturas</h2>

      <ul className="space-y-3">
        {readings.map((reading) => {
          const category = getCategoryPresentation(reading.category)

          return (
            <li
              key={reading.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-line bg-surface/60 p-3"
            >
              <div className="min-w-0">
                <p className="text-sm font-bold text-fg">
                  {reading.systolic} / {reading.diastolic}{" "}
                  <span className="text-[10px] font-normal text-fg-subtle">
                    mmHg
                  </span>
                </p>
                <time
                  dateTime={reading.timestamp}
                  className="text-[10px] text-fg-muted"
                >
                  {dateFormatter.format(new Date(reading.timestamp))}
                </time>
              </div>
              <Badge tone={category.tone}>{category.label}</Badge>
            </li>
          )
        })}
      </ul>

      <Link
        href="/dashboard/history"
        className="block text-center text-xs font-semibold text-accent-text transition-colors hover:text-accent-hover"
      >
        Ver historial →
      </Link>
    </Card>
  )
}
