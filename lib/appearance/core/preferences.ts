import type {
  AccentColor,
  AppearanceValues,
  ThemeMode
} from "@/lib/theme/core/appearance"
import type {
  AppearanceDateFormat,
  AppearanceLanguage,
  AppearancePreferences
} from "./types"

/**
 * Defaults de apariencia, espejo de `AppearancePreference` en el back (SPEC 22).
 * Coinciden con los de SPEC 21 para que una fila recién creada no cambie nada
 * visualmente.
 */
export const DEFAULT_APPEARANCE_PREFERENCES: AppearancePreferences = {
  theme: "dark",
  accent: "blue",
  contrast: "normal",
  motion: "full",
  density: "comfortable",
  language: "es",
  dateFormat: "DD/MM/YYYY"
}

export interface ThemeOption {
  value: ThemeMode
  label: string
  description: string
  /** Id de icono de Lucide; la vista lo resuelve a un componente. */
  icon: "sun" | "moon" | "sparkles"
}

/** Opciones del bloque "Tema de la Aplicación", en el orden del mockup. */
export const THEME_OPTIONS: readonly ThemeOption[] = [
  {
    value: "light",
    label: "Claro",
    description: "Ideal para uso durante el día",
    icon: "sun"
  },
  {
    value: "dark",
    label: "Oscuro",
    description: "Reduce la fatiga visual por la noche",
    icon: "moon"
  },
  {
    value: "auto",
    label: "Automático",
    description: "Sigue el tema de tu sistema",
    icon: "sparkles"
  }
]

export interface AccentOption {
  value: AccentColor
  label: string
}

/** Opciones del bloque "Esquema de Colores". */
export const ACCENT_OPTIONS: readonly AccentOption[] = [
  { value: "blue", label: "Azul" },
  { value: "green", label: "Verde" },
  { value: "purple", label: "Morado" },
  { value: "red", label: "Rojo" }
]

export interface LanguageOption {
  value: AppearanceLanguage
  label: string
  disabled: boolean
  /** Nota visible cuando la opción todavía no está disponible. */
  note?: string
}

/** Opciones del bloque "Idioma y Región" (English aún no traduce la UI). */
export const LANGUAGE_OPTIONS: readonly LanguageOption[] = [
  { value: "es", label: "Español", disabled: false },
  {
    value: "en",
    label: "English",
    disabled: true,
    note: "Disponible próximamente"
  }
]

/** Etiqueta del formato de fecha tal como la muestra la UI (`AAAA`). */
export const DATE_FORMAT_LABELS: Record<AppearanceDateFormat, string> = {
  "DD/MM/YYYY": "DD/MM/AAAA",
  "MM/DD/YYYY": "MM/DD/AAAA"
}

/** El formato de fecha se deriva del idioma; el usuario no lo edita. */
export function deriveDateFormat(
  language: AppearanceLanguage
): AppearanceDateFormat {
  return language === "en" ? "MM/DD/YYYY" : "DD/MM/YYYY"
}

/**
 * Extrae los cinco valores visuales (los que van en la cookie y en `<html>`).
 * `language` y `dateFormat` no afectan al pintado y no se incluyen.
 */
export function toAppearanceValues(
  preferences: AppearancePreferences
): AppearanceValues {
  return {
    theme: preferences.theme,
    accent: preferences.accent,
    contrast: preferences.contrast,
    motion: preferences.motion,
    density: preferences.density
  }
}

/**
 * ¿Los valores del formulario coinciden con los persistidos? Se usa para el
 * "dirty state" de la sección (SPEC 22): comparar contra lo guardado —y no
 * solo contra los defaults de React Hook Form— permite deshabilitar "Guardar
 * Cambios" cuando el usuario vuelve a los valores originales.
 */
export function areAppearancePreferencesEqual(
  a: AppearancePreferences,
  b: AppearancePreferences
): boolean {
  return (
    a.theme === b.theme &&
    a.accent === b.accent &&
    a.contrast === b.contrast &&
    a.motion === b.motion &&
    a.density === b.density &&
    a.language === b.language &&
    a.dateFormat === b.dateFormat
  )
}
