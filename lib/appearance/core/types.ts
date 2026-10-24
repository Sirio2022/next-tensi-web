import type { AppearanceValues } from "@/lib/theme/core/appearance"

/**
 * Contrato de preferencias de apariencia (SPEC 22).
 *
 * Vive en la capa portable `lib/…/core/` (SPEC 17): no importa Next ni toca el
 * DOM. Los cinco valores visuales se reutilizan de `lib/theme/core/appearance`
 * (SPEC 21) porque son los mismos que se escriben en `<html>` y en la cookie.
 */

export type AppearanceLanguage = "es" | "en"

/** Formato de fecha derivado del idioma; nunca se elige a mano. */
export type AppearanceDateFormat = "DD/MM/YYYY" | "MM/DD/YYYY"

/** Contrato completo, espejo de `GET /appearance/preferences`. */
export interface AppearancePreferences extends AppearanceValues {
  language: AppearanceLanguage
  dateFormat: AppearanceDateFormat
}

/** Valores que edita el formulario de la sección (mismo contrato completo). */
export type AppearanceFormValues = AppearancePreferences

/** `GET /appearance/preferences` */
export interface AppearancePreferencesResponse {
  preferences: AppearancePreferences
}

/** `PATCH /appearance/preferences` */
export interface UpdateAppearancePreferencesResponse {
  message: string
  preferences: AppearancePreferences
}

export type UpdateAppearancePreferencesInput =
  Partial<AppearancePreferences>
