import { ButtonLink } from "@/components/ui/button-link"
import { Card } from "@/components/ui/card"
import { formatPercent } from "@/lib/format/percent"
import type { ReadingsMeta } from "@/lib/readings/types"
import { Lock } from "lucide-react"

interface ReadingsLimitCardProps {
  meta: ReadingsMeta
}

/**
 * Contador del límite Free: "N de M lecturas". Los números vienen tal cual de
 * `meta.visible`/`meta.total`; el porcentaje es solo la representación visual de
 * ese ratio, no un cálculo de salud. Con `requiresUpgrade`, avisa de las
 * lecturas ocultas y ofrece el CTA de Premium.
 */
export function ReadingsLimitCard({ meta }: Readonly<ReadingsLimitCardProps>) {
  const ratio = meta.total > 0 ? meta.visible / meta.total : 0

  return (
    <Card className="space-y-4 p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-slate-100">
          Lecturas en tu plan Free
        </h2>
        <span className="text-sm font-bold text-white">
          {meta.visible}
          <span className="font-normal text-slate-400"> / {meta.total}</span>
        </span>
      </div>

      {/* Barra de progreso con el estilo de la app; no hay tag nativo equivalente estilizable. */}
      {/* eslint-disable-next-line jsx-a11y/prefer-tag-over-role */}
      <div
        className="h-1.5 overflow-hidden rounded-full bg-slate-800"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={meta.total}
        aria-valuenow={meta.visible}
        aria-label="Lecturas visibles del total registradas"
      >
        <div
          className="h-full rounded-full bg-tensi-500"
          style={{ width: formatPercent(ratio) }}
        />
      </div>

      {meta.requiresUpgrade ? (
        <div className="flex flex-col gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2 text-xs text-amber-300">
            <Lock className="size-3.5 shrink-0" aria-hidden />
            {meta.hiddenReadings}{" "}
            {meta.hiddenReadings === 1 ? "lectura oculta" : "lecturas ocultas"}{" "}
            por el límite del plan Free.
          </p>
          <ButtonLink
            href="/dashboard#upgrade"
            tone="amber"
            size="sm"
            className="shrink-0"
          >
            Ver Premium
          </ButtonLink>
        </div>
      ) : null}
    </Card>
  )
}
