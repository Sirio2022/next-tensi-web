"use client"

import {
  useAuthProvider,
  type AuthContextValue
} from "@/lib/auth/hooks/use-auth-provider"
import { createContext, useContext, type ReactNode } from "react"
import type { AuthUser } from "./types"

const AuthContext = createContext<AuthContextValue | null>(null)

interface AuthProviderProps {
  /** Usuario resuelto en el server (vía `verifySession()`); `null` si no hay sesión. */
  initialUser: AuthUser | null
  children: ReactNode
}

/**
 * Estado global del usuario de sesión en el cliente, inicializado con el
 * `initialUser` calculado en el server. La lógica vive en `useAuthProvider`;
 * este provider solo conecta el contexto y renderiza. No se usa Zustand; Next
 * recomienda React Context para este caso.
 */
export function AuthProvider({
  initialUser,
  children
}: Readonly<AuthProviderProps>) {
  const value = useAuthProvider(initialUser)

  return <AuthContext value={value}>{children}</AuthContext>
}

export function useAuthContext(): AuthContextValue {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error("useAuthContext debe usarse dentro de un <AuthProvider>")
  }

  return context
}

/** Variante tolerante: devuelve `null` fuera de un provider (p. ej. en `useAuth`). */
export function useOptionalAuthContext(): AuthContextValue | null {
  return useContext(AuthContext)
}
