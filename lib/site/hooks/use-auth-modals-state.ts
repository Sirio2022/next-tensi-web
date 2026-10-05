"use client"

import { useCallback, useMemo, useState } from "react"

export type AuthModalMode = "login" | "register"

export interface AuthModalsActions {
  /** Abre el modal de login. */
  openLogin: () => void
  /** Abre el modal de registro. */
  openRegister: () => void
  /** Cierra el modal activo. */
  close: () => void
}

/**
 * Estado de los modales de auth. Devuelve el `mode` local del provider y las
 * `actions` memoizadas (identidad estable) que expone el contexto, para que
 * abrir un modal no re-renderice a los consumidores que solo tienen acciones
 * (`Hero`, `SiteHeader`, `Cta`).
 */
export function useAuthModalsState() {
  const [mode, setMode] = useState<AuthModalMode | null>(null)

  const openLogin = useCallback(() => setMode("login"), [])
  const openRegister = useCallback(() => setMode("register"), [])
  const close = useCallback(() => setMode(null), [])

  const actions = useMemo<AuthModalsActions>(
    () => ({ openLogin, openRegister, close }),
    [openLogin, openRegister, close]
  )

  return { mode, actions }
}
