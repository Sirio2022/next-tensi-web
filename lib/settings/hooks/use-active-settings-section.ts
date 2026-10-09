"use client"

import { getActiveSettingsSectionId } from "@/lib/settings/core/sections"
import { usePathname } from "next/navigation"

/**
 * Sección activa del sub-sidebar de Configuración a partir del pathname actual.
 * Aísla `usePathname` (SPEC 11) para que el componente de navegación no importe
 * `next/navigation` directamente (frontera portable, SPEC 17).
 */
export function useActiveSettingsSection() {
  const pathname = usePathname()
  return getActiveSettingsSectionId(pathname)
}
