"use client"

import { useOptionalAuthContext } from "@/lib/auth/auth-context"
import * as authApi from "@/lib/auth/auth.api"
import type { MessageResponse } from "@/lib/auth/types"
import { clearAppearanceDraft } from "@/lib/appearance/appearance-draft"
import { resetAppearanceAttributes } from "@/lib/theme/appearance-dom"
import { clearAppearanceCookie } from "@/lib/theme/appearance-cookie"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"

/**
 * Mutación de cierre de sesión aislada. Vive fuera de `useAuth` para que los
 * consumidores que solo cierran sesión (p. ej. el sidebar del dashboard) no
 * arrastren el resto de mutaciones del flujo de auth. `useAuth` la reutiliza
 * para mantener una única implementación.
 */
export function useLogout() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const authContext = useOptionalAuthContext()

  const logout = useMutation<MessageResponse, unknown, void>({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      // Limpia la cookie espejo, los atributos del documento y el borrador sin
      // guardar para que /login vuelva al tema del sistema y el siguiente
      // usuario del dispositivo no herede nada del anterior (SPEC 22).
      clearAppearanceCookie()
      resetAppearanceAttributes()
      clearAppearanceDraft()

      authContext?.setUser(null)
      queryClient.clear()
      router.push("/login")
      router.refresh()
    }
  })

  return { logout }
}
