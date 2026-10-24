import type { HTMLAttributes, Ref, ReactNode } from "react"

export type CardTone = "default" | "upgrade"

const CARD_TONE_CLASSES: Record<CardTone, string> = {
  default: "bg-card/60 border-line",
  upgrade:
    "bg-linear-to-br from-accent-soft via-card to-surface border-accent-line shadow-2xl"
}

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  tone?: CardTone
  children: ReactNode
  /** `ref` como prop normal (React 19); no se usa `forwardRef`. */
  ref?: Ref<HTMLDivElement>
}

/**
 * Contenedor presentacional con el borde/fondo base de las tarjetas del
 * dashboard. No aporta padding ni lógica: cada pantalla decide densidad y layout
 * por `className`. Acepta el resto de atributos nativos (`aria-*`, `data-*`…).
 */
export function Card({
  tone = "default",
  className = "",
  children,
  ref,
  ...rest
}: Readonly<CardProps>) {
  return (
    <div
      ref={ref}
      className={`rounded-3xl border backdrop-blur-xl ${CARD_TONE_CLASSES[tone]} ${className}`}
      {...rest}
    >
      {children}
    </div>
  )
}
