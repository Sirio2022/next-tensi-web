import type { ButtonHTMLAttributes, ReactNode } from 'react'

export type ButtonTone = 'primary' | 'gradient' | 'amber'
export type ButtonSize = 'sm' | 'md'

const BUTTON_TONE_CLASSES: Record<ButtonTone, string> = {
  primary:
    'bg-tensi-600 hover:bg-tensi-500 text-white shadow-lg shadow-tensi-600/25',
  gradient:
    'bg-linear-to-r from-tensi-600 to-tensi-violet text-white shadow-lg shadow-tensi-600/20',
  amber:
    'bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-md shadow-amber-500/10',
}

const BUTTON_SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-5 py-3 text-sm',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: ButtonTone
  size?: ButtonSize
  className?: string
  children: ReactNode
}

/**
 * Botón presentacional. Sin lógica de negocio: recibe `onClick`, `disabled` y
 * el resto de atributos nativos. `type` por defecto es `button` para no
 * someterse por accidente dentro de un formulario.
 */
export function Button({
  tone = 'primary',
  size = 'md',
  type = 'button',
  className = '',
  children,
  ...rest
}: Readonly<ButtonProps>) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tensi-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-60 ${BUTTON_SIZE_CLASSES[size]} ${BUTTON_TONE_CLASSES[tone]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}
