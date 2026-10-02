/**
 * Fuente única de las clases de tono de la UI (píldoras y tarjetas de rango).
 * Evita que `Badge` y `BpRangesReference` mantengan mapas duplicados que se
 * desincronizan. `neutral` solo lo usa `Badge`; el resto son compartidos.
 */
export type ToneName =
  | "sky"
  | "emerald"
  | "emerald-soft"
  | "amber"
  | "orange"
  | "rose"
  | "neutral"

export const TONE_CLASSES: Record<ToneName, string> = {
  neutral: "bg-slate-800 text-slate-300 border-slate-700",
  amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  sky: "bg-sky-500/10 text-sky-300 border-sky-500/20",
  emerald: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
  "emerald-soft": "bg-emerald-500/5 text-emerald-400 border-emerald-500/10",
  orange: "bg-orange-500/10 text-orange-300 border-orange-500/20",
  rose: "bg-rose-500/10 text-rose-300 border-rose-500/20"
}
