import { BP_RANGE_DISPLAY, type BpRangeTone } from '@/lib/dashboard/bp-ranges'

const BP_RANGE_TONE_CLASSES: Record<BpRangeTone, string> = {
  sky: 'bg-sky-500/10 border-sky-500/20 text-sky-300',
  emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300',
  'emerald-soft':
    'bg-emerald-500/5 border-emerald-500/10 text-emerald-400',
  amber: 'bg-amber-500/10 border-amber-500/20 text-amber-300',
  orange: 'bg-orange-500/10 border-orange-500/20 text-orange-300',
  rose: 'bg-rose-500/10 border-rose-500/20 text-rose-300',
}

/** Tabla de referencia educativa de rangos OMS, en la grilla responsive del mockup. */
export function BpRangesReference() {
  return (
    <section className="space-y-4 rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white">
          Referencia de Rangos de Presión Arterial (OMS)
        </h3>
        <span className="text-[10px] text-slate-400">
          Sistólica / Diastólica
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-center text-[11px] sm:grid-cols-4 lg:grid-cols-6">
        {BP_RANGE_DISPLAY.map((entry) => (
          <div
            key={entry.label}
            className={`rounded-xl border p-2.5 ${BP_RANGE_TONE_CLASSES[entry.tone]}`}
          >
            <span className="block font-bold">{entry.label}</span>
            <span className="text-[10px] text-slate-400">{entry.range}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
