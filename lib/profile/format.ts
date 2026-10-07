import type { MedicationGroup } from "./medications"

/**
 * Helpers puros del dominio de perfil: normalizan entradas del usuario y
 * convierten entre las unidades de la UI y las que guarda el back. No contienen
 * estado ni acceden a APIs, por lo que se pueden probar de forma aislada.
 */

/** Redondeo a `decimals` decimales para evitar ruido de coma flotante. */
function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals
  return Math.round(value * factor) / factor
}

/**
 * Estatura en centímetros → metros (como la guarda el back), 2 decimales: 1 cm
 * equivale a 0.01 m, así que hacen falta 2 decimales para no perder precisión
 * (p. ej. 175 cm → 1.75 m).
 */
export function divideBy100(value: number): number {
  return roundTo(value / 100, 2)
}

/** Estatura en metros → centímetros (como la muestra la UI), 1 decimal. */
export function times100(value: number): number {
  return roundTo(value * 100, 1)
}

/**
 * Convierte el valor del input libre de medicamentos en una lista: separa por
 * comas, recorta los espacios, descarta los vacíos y deduplica conservando el
 * orden de aparición.
 */
export function parseMedicationInput(value: string): string[] {
  const seen = new Set<string>()
  const result: string[] = []

  for (const raw of value.split(",")) {
    const medication = raw.trim()
    if (!medication || seen.has(medication)) continue

    seen.add(medication)
    result.push(medication)
  }

  return result
}

/** `birthDate` ISO del back → valor `yyyy-mm-dd` para `<input type="date">`. */
export function toDateInputValue(iso: string | null): string {
  return iso ? iso.slice(0, 10) : ""
}

/** Valor `yyyy-mm-dd` del input → ISO. Devuelve `""` si el valor es inválido. */
export function toDateISO(value: string): string {
  if (!value) return ""

  const date = new Date(`${value}T00:00:00.000Z`)
  return Number.isNaN(date.getTime()) ? "" : date.toISOString()
}

export interface NormalizedMedications {
  /** Medicamentos que pertenecen a alguno de los grupos predefinidos. */
  known: string[]
  /** Medicamentos personalizados que no están en el catálogo ("Otros"). */
  custom: string[]
}

/**
 * Separa una lista de medicamentos en los que están en el catálogo y los
 * personalizados, para poder pintar los chips de grupo y el grupo "Otros".
 */
export function normalizeMedications(
  medications: readonly string[],
  groups: readonly MedicationGroup[]
): NormalizedMedications {
  const predefined = new Set(groups.flatMap((group) => group.medications))
  const known: string[] = []
  const custom: string[] = []

  for (const medication of medications) {
    if (predefined.has(medication)) known.push(medication)
    else custom.push(medication)
  }

  return { known, custom }
}
