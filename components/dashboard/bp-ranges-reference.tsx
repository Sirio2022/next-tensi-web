import { TONE_CLASSES } from "@/components/ui/tone-classes"
import { BP_RANGE_DISPLAY } from "@/lib/dashboard/bp-ranges"

/** Tabla de referencia educativa de rangos OMS, en la grilla responsive del mockup. */
export function BpRangesReference() {
  return (
    <section className="space-y-4 rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-white">
          Referencia de Rangos de Presión Arterial (OMS)
        </h2>
        <span className="text-[10px] text-slate-400">
          Sistólica / Diastólica
        </span>
      </div>

      <ul className="grid grid-cols-2 gap-2 text-center text-[11px] sm:grid-cols-4 lg:grid-cols-6">
        {BP_RANGE_DISPLAY.map((entry) => (
          <li
            key={entry.label}
            /* `data-categories` ata la vista a las categorías clínicas reales
               de `lib/bp/bp-categories.ts` (fuente única), consumiendo así el
               campo `categories` sin duplicar la tabla numérica. */
            data-categories={entry.categories.join(" ")}
            className={`rounded-xl border p-2.5 ${TONE_CLASSES[entry.tone]}`}
          >
            <span className="block font-bold">{entry.label}</span>
            <span className="text-[10px] text-slate-400">{entry.range}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
