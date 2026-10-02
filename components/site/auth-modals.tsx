'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { LoginForm } from '@/components/auth/login-form'
import { RegisterForm } from '@/components/auth/register-form'

export type AuthModalMode = 'login' | 'register'

interface AuthModalsContextValue {
  /** Abre el modal de login. */
  openLogin: () => void
  /** Abre el modal de registro. */
  openRegister: () => void
  /** Cierra el modal activo. */
  close: () => void
  /** Modal actualmente activo, o `null` si no hay ninguno. */
  mode: AuthModalMode | null
}

const AuthModalsContext = createContext<AuthModalsContextValue | null>(null)

/** Acceso al estado de los modales de auth desde cualquier cliente. */
export function useAuthModals(): AuthModalsContextValue {
  const context = useContext(AuthModalsContext)
  if (!context) {
    throw new Error('useAuthModals debe usarse dentro de un AuthModalsProvider')
  }
  return context
}

/**
 * Provee los modales de login y registro de la landing. Monta los mismos
 * `LoginForm`/`RegisterForm` de la SPEC 01 (cero duplicación de formularios).
 */
export function AuthModalsProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [mode, setMode] = useState<AuthModalMode | null>(null)

  const openLogin = useCallback(() => setMode('login'), [])
  const openRegister = useCallback(() => setMode('register'), [])
  const close = useCallback(() => setMode(null), [])

  const value = useMemo<AuthModalsContextValue>(
    () => ({ openLogin, openRegister, close, mode }),
    [openLogin, openRegister, close, mode],
  )

  return (
    <AuthModalsContext.Provider value={value}>
      {children}

      <Modal
        open={mode === 'login'}
        onClose={close}
        title="Iniciar Sesión"
        description="Accede a tu historial y registro de mediciones"
      >
        <LoginForm />
      </Modal>

      <Modal
        open={mode === 'register'}
        onClose={close}
        title="Crear Cuenta Gratis"
        description="Comienza a controlar tu salud cardiovascular con Tensi"
      >
        <RegisterForm />
      </Modal>
    </AuthModalsContext.Provider>
  )
}

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  description: string
  children: ReactNode
}

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

/**
 * Modal base con overlay y panel. Cierra por Escape, click en el backdrop y
 * botón de cierre; al abrir mueve el foco al panel y lo atrapa con Tab, bloquea
 * el scroll del fondo y al cerrar restaura el foco al elemento que lo abrió.
 */
function Modal({ open, onClose, title, description, children }: Readonly<ModalProps>) {
  const titleId = useId()
  const descriptionId = useId()
  const panelRef = useRef<HTMLDivElement>(null)
  const previouslyFocused = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!open) return

    previouslyFocused.current = document.activeElement as HTMLElement | null
    const panel = panelRef.current
    const focusables = () =>
      panel ? Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)) : []

    ;(focusables()[0] ?? panel)?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }

      if (event.key !== 'Tab' || !panel) return

      const items = focusables()
      if (items.length === 0) {
        event.preventDefault()
        panel.focus()
        return
      }

      const first = items[0]
      const last = items[items.length - 1]
      const active = document.activeElement

      if (event.shiftKey) {
        if (active === first || !panel.contains(active)) {
          event.preventDefault()
          last.focus()
        }
      } else if (active === last || !panel.contains(active)) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
      previouslyFocused.current?.focus()
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
        className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl outline-none"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 id={titleId} className="text-xl font-bold text-white mb-1">
          {title}
        </h2>
        <p id={descriptionId} className="text-xs text-slate-400 mb-6">
          {description}
        </p>

        {children}
      </div>
    </div>
  )
}
