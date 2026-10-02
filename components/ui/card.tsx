import type { ReactNode } from 'react'

export type CardTone = 'default' | 'upgrade'

const CARD_TONE_CLASSES: Record<CardTone, string> = {
  default: 'bg-slate-900/60 border-slate-800/80',
  upgrade:
    'bg-linear-to-br from-indigo-950/80 via-slate-900 to-slate-950 border-indigo-500/30 shadow-2xl',
}

interface CardProps {
  id?: string
  tone?: CardTone
  className?: string
  children: ReactNode
}

/**
 * Contenedor presentacional con el borde/fondo base de las tarjetas del
 * dashboard. No aporta padding ni lógica: cada pantalla decide densidad y layout
 * por `className`.
 */
export function Card({
  id,
  tone = 'default',
  className = '',
  children,
}: Readonly<CardProps>) {
  return (
    <div
      id={id}
      className={`rounded-3xl border backdrop-blur-xl ${CARD_TONE_CLASSES[tone]} ${className}`}
    >
      {children}
    </div>
  )
}
