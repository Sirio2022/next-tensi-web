import { z } from "zod"

/**
 * Schema zod espejo de `UpdateAppearancePreferencesDto` en el back (SPEC 22).
 *
 * Valida el contrato completo: el formulario envía todos los campos en un solo
 * `PATCH` para que el estado de la sección se persista de una vez.
 */
export const appearancePreferencesSchema = z.object({
  theme: z.enum(["dark", "light", "auto"]),
  accent: z.enum(["blue", "green", "purple", "red"]),
  contrast: z.enum(["normal", "high"]),
  motion: z.enum(["full", "reduced"]),
  density: z.enum(["comfortable", "compact"]),
  language: z.enum(["es", "en"]),
  dateFormat: z.enum(["DD/MM/YYYY", "MM/DD/YYYY"])
})
