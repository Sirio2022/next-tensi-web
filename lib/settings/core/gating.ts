/**
 * Mecanismo de gating Free/Premium (SPEC 18).
 *
 * Vive en la capa portable `lib/…/core/` (SPEC 17): es una regla pura, sin
 * dependencias de Next ni del DOM, lista para que las specs de sección (Apariencia,
 * Notificaciones, Seguridad) decidan qué control queda bloqueado en Free sin
 * duplicar la condición. En esta spec no se aplica a ninguna sección todavía.
 */

import type { Plan } from "@/lib/auth/types"

/**
 * `true` cuando un control que requiere Premium queda bloqueado para el plan del
 * usuario. Solo el plan Free queda bloqueado: Premium siempre desbloquea.
 */
export function isLockedForPlan(
  requiresPremium: boolean,
  plan: Plan
): boolean {
  return requiresPremium && plan === "FREE"
}
