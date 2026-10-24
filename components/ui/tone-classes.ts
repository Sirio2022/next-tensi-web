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
  neutral: "bg-card-muted text-fg-muted border-line-strong",
  amber: "bg-amber-500/10 text-tone-amber border-amber-500/30",
  sky: "bg-sky-500/10 text-tone-sky border-sky-500/30",
  emerald: "bg-emerald-500/10 text-tone-emerald border-emerald-500/30",
  "emerald-soft": "bg-emerald-500/5 text-tone-emerald border-emerald-500/20",
  orange: "bg-orange-500/10 text-tone-orange border-orange-500/30",
  rose: "bg-rose-500/10 text-tone-rose border-rose-500/30"
}
