'use client'

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import type { AuthUser } from './types'

interface AuthContextValue {
  user: AuthUser | null
  setUser: (user: AuthUser | null) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

interface AuthProviderProps {
  /** Usuario resuelto en el server (vía `verifySession()`); `null` si no hay sesión. */
  initialUser: AuthUser | null
  children: ReactNode
}

/**
 * Estado global del usuario de sesión en el cliente, inicializado con el
 * `initialUser` calculado en el server. No se usa Zustand; Next recomienda
 * React Context para este caso.
 */
export function AuthProvider({ initialUser, children }: Readonly<AuthProviderProps>) {
  const [user, setUser] = useState<AuthUser | null>(initialUser)

  // El valor del contexto se memoiza para que los consumidores no se
  // re-rendericen cuando el provider lo hace por motivos ajenos a `user`
  // (p. ej. el nuevo render del layout tras `router.refresh()` o al navegar).
  const value = useMemo<AuthContextValue>(() => ({ user, setUser }), [user])

  return <AuthContext value={value}>{children}</AuthContext>
}

export function useAuthContext(): AuthContextValue {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuthContext debe usarse dentro de un <AuthProvider>')
  }

  return context
}

/** Variante tolerante: devuelve `null` fuera de un provider (p. ej. en `useAuth`). */
export function useOptionalAuthContext(): AuthContextValue | null {
  return useContext(AuthContext)
}
