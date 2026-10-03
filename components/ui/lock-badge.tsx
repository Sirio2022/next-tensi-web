import { Lock } from "lucide-react"
import type { HTMLAttributes, Ref } from "react"

interface LockBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Texto accesible del candado; por defecto indica que la feature es Premium. */
  label?: string
  /** `ref` como prop normal (React 19); no se usa `forwardRef`. */
  ref?: Ref<HTMLSpanElement>
}

const DEFAULT_LABEL = "Requiere plan Premium"

/**
 * Candado ámbar reutilizable (Análisis, Reportes PDF). Es puramente
 * presentacional: no maneja click; el ítem que lo contiene es quien navega o
 * desplaza al banner de upgrade.
 */
export function LockBadge({
  label = DEFAULT_LABEL,
  className = "",
  ref,
  ...rest
}: Readonly<LockBadgeProps>) {
  return (
    <span
      ref={ref}
      className={`inline-flex rounded-md border border-amber-500/20 bg-amber-500/10 p-1 text-amber-400 ${className}`}
      {...rest}
    >
      {/* Icono Lucide sin tag nativo equivalente; role="img" + aria-label es el patrón accesible correcto. */}
      {/* eslint-disable-next-line jsx-a11y/prefer-tag-over-role */}
      <Lock className="size-3.5" role="img" aria-label={label} />
    </span>
  )
}
