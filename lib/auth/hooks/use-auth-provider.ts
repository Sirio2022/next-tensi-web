"use client"

import type { AuthUser } from "@/lib/auth/types"
import { useMemo, useState } from "react"

export interface AuthContextValue {
  user: AuthUser | null
  setUser: (user: AuthUser | null) => void
}

/**
 * Estado global del usuario de sesión en el cliente, inicializado con el
 * `initialUser` calculado en el server. No se usa Zustand; Next recomienda
 * React Context para este caso.
 */
export function useAuthProvider(
  initialUser: AuthUser | null
): AuthContextValue {
  const [user, setUser] = useState<AuthUser | null>(initialUser)

  // El valor del contexto se memoiza para que los consumidores no se
  // re-rendericen cuando el provider lo hace por motivos ajenos a `user`
  // (p. ej. el nuevo render del layout tras `router.refresh()` o al navegar).
  return useMemo<AuthContextValue>(() => ({ user, setUser }), [user])
}
