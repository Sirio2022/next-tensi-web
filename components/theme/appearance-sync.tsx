"use client"

import type { AppearanceValues } from "@/lib/theme/core/appearance"
import { useAppearanceSync } from "@/lib/theme/hooks/use-appearance-sync"

interface AppearanceSyncProps {
  values: AppearanceValues
}

/**
 * Puente sin UI entre el layout autenticado (Server Component) y el hook de
 * sincronización (SPEC 22). El layout solo lo renderiza cuando falta la cookie
 * `tensi_appearance`; en cuanto el hook la escribe, deja de montarse.
 */
export function AppearanceSync({ values }: Readonly<AppearanceSyncProps>) {
  useAppearanceSync(values)

  return null
}
