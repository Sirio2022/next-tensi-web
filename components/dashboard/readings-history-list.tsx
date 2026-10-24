import { Badge } from "@/components/ui/badge"
import { ButtonLink } from "@/components/ui/button-link"
import { Card } from "@/components/ui/card"
import { getCategoryPresentation } from "@/lib/readings/categories"
import type { BPReading, ReadingsMeta } from "@/lib/readings/types"
import { ClipboardList, HeartPulse } from "lucide-react"
import { ReadingsLimitCard } from "./readings-limit-card"

interface ReadingsHistoryListProps {
  readings: readonly BPReading[]
  meta: ReadingsMeta
}

const dateFormatter = new Intl.DateTimeFormat("es-ES", {
  dateStyle: "medium",
  timeStyle: "short"
})

function EmptyHistory() {
  return (
    <Card className="p-card text-center">
      <div className="mx-auto max-w-md space-y-4">
        <div className="mx-auto flex size-16 items-center justify-center rounded-2xl border border-line-strong bg-card-muted/60 text-fg-muted">
          <ClipboardList className="size-8" aria-hidden />
        </div>
        <h2 className="text-xl font-bold tracking-tight text-fg">
          Aún no hay mediciones
        </h2>
        <p className="text-xs/relaxed text-fg-muted">
          Registra tu primera lectura para empezar a construir tu historial de
          presión arterial.
        </p>
        <div className="pt-2">
          <ButtonLink href="/dashboard/new-reading" tone="gradient">
            Agregar mi primera medición
          </ButtonLink>
        </div>
      </div>
    </Card>
  )
}

function ReadingRow({ reading }: Readonly<{ reading: BPReading }>) {
  const category = getCategoryPresentation(reading.category)

  return (
    <Card className="p-card">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <Badge tone={category.tone}>{category.label}</Badge>
        <time dateTime={reading.timestamp} className="text-xs text-fg-muted">
          {dateFormatter.format(new Date(reading.timestamp))}
        </time>
      </div>

      <div className="mt-3 flex flex-wrap items-end gap-x-6 gap-y-2">
        <p className="flex items-baseline gap-1.5">
          <span className="text-2xl font-extrabold text-fg">
            {reading.systolic}
          </span>
          <span className="text-fg-subtle">/</span>
          <span className="text-xl font-bold text-fg">
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

      {reading.tags.length > 0 ? (
        <ul className="mt-3 flex flex-wrap gap-2">
          {reading.tags.map((tag) => (
            <li key={tag}>
              <Badge tone="neutral">{tag}</Badge>
            </li>
          ))}
        </ul>
      ) : null}

      {reading.notes ? (
        <p className="mt-3 rounded-xl border border-line bg-surface/60 p-3 text-xs/relaxed text-fg-muted">
          {reading.notes}
        </p>
      ) : null}
    </Card>
  )
}

/**
 * Historial de solo lectura del plan Free. Lista las lecturas visibles tal cual
 * llegan de `GET /bp-readings`; con `requiresUpgrade` antepone el aviso de
 * límite (`hiddenReadings` + CTA) y, sin lecturas, muestra el estado vacío.
 */
export function ReadingsHistoryList({
  readings,
  meta
}: Readonly<ReadingsHistoryListProps>) {
  if (readings.length === 0) {
    return <EmptyHistory />
  }

  return (
    <div className="space-y-6">
      {meta.requiresUpgrade ? <ReadingsLimitCard meta={meta} /> : null}

      <ul className="space-y-4">
        {readings.map((reading) => (
          <li key={reading.id}>
            <ReadingRow reading={reading} />
          </li>
        ))}
      </ul>
    </div>
  )
}
