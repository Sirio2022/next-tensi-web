"use client"

import { useAuthModals } from "@/components/site/auth-modals"
import { useCallback, useState } from "react"

/**
 * Estado del header de la landing: si el menú móvil está abierto y las acciones
 * que lo cierran antes de abrir los modales de auth.
 */
export function useSiteHeader() {
  const { openLogin, openRegister } = useAuthModals()
  const [menuOpen, setMenuOpen] = useState(false)

  const closeMenu = useCallback(() => setMenuOpen(false), [])
  const toggleMenu = useCallback(() => setMenuOpen((value) => !value), [])

  const handleLogin = useCallback(() => {
    setMenuOpen(false)
    openLogin()
  }, [openLogin])

  const handleRegister = useCallback(() => {
    setMenuOpen(false)
    openRegister()
  }, [openRegister])

  return { menuOpen, closeMenu, toggleMenu, handleLogin, handleRegister }
}
