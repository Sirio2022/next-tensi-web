"use client"

import { getActiveNavId } from "@/lib/dashboard/nav"
import { usePathname } from "next/navigation"

/** Ítem activo del sidebar a partir del pathname actual (el prefijo más específico). */
export function useActiveNavId() {
  const pathname = usePathname()
  return getActiveNavId(pathname)
}
