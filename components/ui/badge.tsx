import { TONE_CLASSES, type ToneName } from "@/components/ui/tone-classes"
import type { HTMLAttributes, ReactNode, Ref } from "react"

export type BadgeTone = ToneName

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone
  children: ReactNode
  /** `ref` como prop normal (React 19); no se usa `forwardRef`. */
  ref?: Ref<HTMLSpanElement>
}

/** Etiqueta compacta en forma de píldora; `tone` cubre las paletas del dashboard. */
export function Badge({
  tone = "neutral",
  className = "",
  children,
  ref,
  ...rest
}: Readonly<BadgeProps>) {
  return (
    <span
      ref={ref}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${TONE_CLASSES[tone]} ${className}`}
      {...rest}
    >
      {children}
    </span>
  )
}
