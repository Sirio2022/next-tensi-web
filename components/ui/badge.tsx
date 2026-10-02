import type { ReactNode } from 'react'

export type BadgeTone =
  | 'neutral'
  | 'amber'
  | 'sky'
  | 'emerald'
  | 'emerald-soft'
  | 'orange'
  | 'rose'

const BADGE_TONE_CLASSES: Record<BadgeTone, string> = {
  neutral: 'bg-slate-800 text-slate-300 border-slate-700',
  amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  sky: 'bg-sky-500/10 text-sky-300 border-sky-500/20',
  emerald: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
  'emerald-soft':
    'bg-emerald-500/5 text-emerald-400 border-emerald-500/10',
  orange: 'bg-orange-500/10 text-orange-300 border-orange-500/20',
  rose: 'bg-rose-500/10 text-rose-300 border-rose-500/20',
}

interface BadgeProps {
  tone?: BadgeTone
  className?: string
  children: ReactNode
}

/** Etiqueta compacta en forma de píldora; `tone` cubre las paletas del dashboard. */
export function Badge({
  tone = 'neutral',
  className = '',
  children,
}: Readonly<BadgeProps>) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${BADGE_TONE_CLASSES[tone]} ${className}`}
    >
      {children}
    </span>
  )
}
