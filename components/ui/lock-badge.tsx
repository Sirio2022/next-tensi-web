interface LockBadgeProps {
  /** Texto accesible del candado; por defecto indica que la feature es Premium. */
  label?: string
  className?: string
}

const DEFAULT_LABEL = 'Requiere plan Premium'

/**
 * Candado ámbar reutilizable (Análisis, Reportes PDF). Es puramente
 * presentacional: no maneja click; el ítem que lo contiene es quien navega o
 * desplaza al banner de upgrade.
 */
export function LockBadge({
  label = DEFAULT_LABEL,
  className = '',
}: Readonly<LockBadgeProps>) {
  return (
    <span
      className={`inline-flex rounded-md border border-amber-500/20 bg-amber-500/10 p-1 text-amber-400 ${className}`}
    >
      {/* Icono SVG sin tag nativo equivalente; role="img" + aria-label es el patrón accesible correcto. */}
      {/* eslint-disable-next-line jsx-a11y/prefer-tag-over-role */}
      <svg
        className="size-3.5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        role="img"
        aria-label={label}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
        />
      </svg>
    </span>
  )
}
