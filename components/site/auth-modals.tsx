"use client"

import { LoginForm } from "@/components/auth/login-form"
import { RegisterForm } from "@/components/auth/register-form"
import { X } from "lucide-react"
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from "react"

export type AuthModalMode = "login" | "register"

interface AuthModalsActions {
  /** Abre el modal de login. */
  openLogin: () => void
  /** Abre el modal de registro. */
  openRegister: () => void
  /** Cierra el modal activo. */
  close: () => void
}

const AuthModalsContext = createContext<AuthModalsActions | null>(null)

/** Acceso a las acciones de los modales de auth desde cualquier cliente. */
export function useAuthModals(): AuthModalsActions {
  const context = useContext(AuthModalsContext)
  if (!context) {
    throw new Error("useAuthModals debe usarse dentro de un AuthModalsProvider")
  }
  return context
}

/**
 * Provee los modales de login y registro de la landing. Monta los mismos
 * `LoginForm`/`RegisterForm` de la SPEC 01 (cero duplicación de formularios).
 *
 * El contexto expone solo las **acciones** (estables) y el `mode` vive en el
 * estado local del provider, para que abrir un modal no re-renderice a los
 * consumidores que solo tienen acceso a las acciones (`Hero`, `SiteHeader`,
 * `Cta`).
 */
export function AuthModalsProvider({
  children
}: Readonly<{ children: ReactNode }>) {
  const [mode, setMode] = useState<AuthModalMode | null>(null)

  const openLogin = useCallback(() => setMode("login"), [])
  const openRegister = useCallback(() => setMode("register"), [])
  const close = useCallback(() => setMode(null), [])

  const actions = useMemo<AuthModalsActions>(
    () => ({ openLogin, openRegister, close }),
    [openLogin, openRegister, close]
  )

  return (
    <AuthModalsContext.Provider value={actions}>
      {children}

      <Modal
        open={mode === "login"}
        onClose={close}
        title="Iniciar Sesión"
        description="Accede a tu historial y registro de mediciones"
      >
        <LoginForm />
      </Modal>

      <Modal
        open={mode === "register"}
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

/**
 * Modal base construido sobre el elemento nativo `<dialog>`. `showModal()` ya
 * aporta el focus trap, el cierre con Escape y la capa superior (`::backdrop`),
 * así que solo manejamos el cierre por backdrop, el bloqueo del scroll y la
 * restauración del foco al cerrar.
 */
function Modal({
  open,
  onClose,
  title,
  description,
  children
}: Readonly<ModalProps>) {
  const titleId = useId()
  const descriptionId = useId()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const previouslyFocused = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog || !open) return

    previouslyFocused.current = document.activeElement as HTMLElement | null
    if (!dialog.open) dialog.showModal()

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    return () => {
      document.body.style.overflow = previousOverflow
      previouslyFocused.current?.focus()
    }
  }, [open])

  if (!open) return null

  return (
    <dialog
      ref={dialogRef}
      // El elemento nativo cierra con Escape disparando `cancel`; evitamos su
      // cierre por defecto y dejamos que el estado del provider lo desmonte.
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      className="m-0 flex size-full max-h-none max-w-none items-center justify-center border-0 bg-transparent p-4 backdrop:bg-black/75 backdrop:backdrop-blur-sm"
    >
      <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        >
          <X className="size-5" />
        </button>

        <h2 id={titleId} className="text-xl font-bold text-white mb-1">
          {title}
        </h2>
        <p id={descriptionId} className="text-xs text-slate-400 mb-6">
          {description}
        </p>

        {children}
      </div>
    </dialog>
  )
}
