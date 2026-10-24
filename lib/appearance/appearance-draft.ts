import type { AppearanceFormValues } from "@/lib/appearance/core/types"

/**
 * Borrador en memoria de la sección Apariencia (SPEC 22).
 *
 * La preview es optimista: se aplica al documento al tocar un control, pero la
 * cookie y la base de datos solo cambian al pulsar "Guardar Cambios". Para que
 * esa preview sobreviva a la navegación —y solo se descarte al recargar— el
 * formulario recuerda sus valores sin guardar en este módulo.
 *
 * Es estado de módulo a propósito: vive mientras dure el documento, así que
 * recargar lo reinicia (vuelven los valores persistidos) y no hay que limpiar
 * `sessionStorage` ni sincronizar entre pestañas (fuera del alcance de la spec).
 */
let draft: AppearanceFormValues | null = null

/** Último borrador sin guardar, o `null` si no hay cambios pendientes. */
export function readAppearanceDraft(): AppearanceFormValues | null {
  return draft
}

/** Guarda los valores actuales del formulario como borrador. */
export function writeAppearanceDraft(values: AppearanceFormValues): void {
  draft = values
}

/** Descarta el borrador (al guardar, cerrar sesión o salir de la cuenta). */
export function clearAppearanceDraft(): void {
  draft = null
}
