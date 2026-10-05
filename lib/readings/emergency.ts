import type { EmergencySeverity } from "@/lib/readings/types"

/** Una crisis exige alerta inmediata: hipertensiva o hipotensiva. */
export function isCrisisSeverity(severity: EmergencySeverity): boolean {
  return (
    severity === "CRISIS_HYPERTENSIVE" || severity === "CRISIS_HYPOTENSIVE"
  )
}
