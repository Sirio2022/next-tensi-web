/**
 * Preferencias de apariencia de Tensi (SPEC 21).
 *
 * Núcleo portable: no depende de Next, del DOM ni del runtime de servidor, para
 * que la web y la futura app Expo reutilicen el mismo modelo. Aquí viven los
 * tipos, los valores por defecto, la serialización/parseo de la cookie
 * `tensi_appearance` y la resolución de atributos de `<html>`.
 *
 * El único estado es cosmético: qué tema, acento, contraste, motion y densidad
 * se aplican. La escritura de la cookie y la UI de configuración llegan en la
 * SPEC 22; esta capa solo define y lee el formato.
 */

/** Modo de tema. `auto` delega en `prefers-color-scheme`. */
export type ThemeMode = "dark" | "light" | "auto"

/** Acento de la interfaz. Azul es el valor por defecto (`tensi-600`). */
export type AccentColor = "blue" | "green" | "purple" | "red"

/** Nivel de contraste de textos y bordes. */
export type ContrastLevel = "normal" | "high"

/** Preferencia de movimiento. */
export type MotionPreference = "full" | "reduced"

/** Densidad del contenido del dashboard. */
export type DensityPreference = "comfortable" | "compact"

export interface AppearanceValues {
  theme: ThemeMode
  accent: AccentColor
  contrast: ContrastLevel
  motion: MotionPreference
  density: DensityPreference
}

export const DEFAULT_APPEARANCE: AppearanceValues = {
  theme: "dark",
  accent: "blue",
  contrast: "normal",
  motion: "full",
  density: "comfortable"
}

export const APPEARANCE_COOKIE = "tensi_appearance"

const THEME_MODES: readonly ThemeMode[] = ["dark", "light", "auto"]
const ACCENT_COLORS: readonly AccentColor[] = ["blue", "green", "purple", "red"]
const CONTRAST_LEVELS: readonly ContrastLevel[] = ["normal", "high"]
const MOTION_PREFERENCES: readonly MotionPreference[] = ["full", "reduced"]
const DENSITY_PREFERENCES: readonly DensityPreference[] = ["comfortable", "compact"]

/**
 * Atributos que se escriben en `<html>`.
 *
 * `theme: "auto"` omite `data-theme` para que decida `prefers-color-scheme`.
 * Los valores por defecto del CSS (`blue`, `normal`, `full`, `comfortable`)
 * también se omiten: su ausencia ya significa eso.
 */
export interface AppearanceAttributes {
  "data-theme"?: "light" | "dark"
  "data-accent"?: "green" | "purple" | "red"
  "data-contrast"?: "high"
  "data-motion"?: "reduced"
  "data-density"?: "compact"
}

function pick<T extends string>(
  value: string | undefined,
  allowed: readonly T[],
  fallback: T
): T {
  return allowed.includes(value as T) ? (value as T) : fallback
}

function decode(value: string): string {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

/**
 * Serializa las preferencias al valor de la cookie, por ejemplo:
 * `"theme=light&accent=green&contrast=high&motion=reduced&density=compact"`.
 *
 * Se construye a mano (sin `URLSearchParams`) para que el núcleo funcione
 * igual en React Native; los valores son tokens ASCII sin caracteres especiales.
 */
export function serializeAppearanceCookie(values: AppearanceValues): string {
  return [
    `theme=${values.theme}`,
    `accent=${values.accent}`,
    `contrast=${values.contrast}`,
    `motion=${values.motion}`,
    `density=${values.density}`
  ].join("&")
}

/**
 * Parsea el valor de la cookie. El valor se decodifica entero primero (la
 * cookie viaja como `theme%3Dlight` o `theme%3Dlight%26accent%3Dgreen`), luego
 * se separan los pares. Un campo inválido o ausente cae a su valor por defecto;
 * nunca lanza. Las claves desconocidas se ignoran y, si una clave se repite,
 * gana la última aparición.
 */
export function parseAppearanceCookie(
  raw: string | undefined
): AppearanceValues {
  if (!raw) {
    return { ...DEFAULT_APPEARANCE }
  }

  const parsed: Partial<Record<keyof AppearanceValues, string>> = {}

  for (const pair of decode(raw).split("&")) {
    if (!pair) continue

    const separatorIndex = pair.indexOf("=")
    const key = separatorIndex === -1 ? pair : pair.slice(0, separatorIndex)
    const value =
      separatorIndex === -1 ? "" : pair.slice(separatorIndex + 1)

    if (
      key === "theme" ||
      key === "accent" ||
      key === "contrast" ||
      key === "motion" ||
      key === "density"
    ) {
      parsed[key] = value
    }
  }

  return {
    theme: pick(parsed.theme, THEME_MODES, DEFAULT_APPEARANCE.theme),
    accent: pick(parsed.accent, ACCENT_COLORS, DEFAULT_APPEARANCE.accent),
    contrast: pick(
      parsed.contrast,
      CONTRAST_LEVELS,
      DEFAULT_APPEARANCE.contrast
    ),
    motion: pick(parsed.motion, MOTION_PREFERENCES, DEFAULT_APPEARANCE.motion),
    density: pick(
      parsed.density,
      DENSITY_PREFERENCES,
      DEFAULT_APPEARANCE.density
    )
  }
}

/**
 * Traduce las preferencias a los atributos de `<html>`. Solo emite los valores
 * que difieren del default del CSS; el resto se omite para que el navegador
 * decida (tema claro/oscuro del sistema) o para no ensuciar el DOM.
 */
export function toAppearanceAttributes(
  values: AppearanceValues
): AppearanceAttributes {
  const attributes: AppearanceAttributes = {}

  if (values.theme !== "auto") {
    attributes["data-theme"] = values.theme
  }
  if (values.accent !== "blue") {
    attributes["data-accent"] = values.accent
  }
  if (values.contrast === "high") {
    attributes["data-contrast"] = "high"
  }
  if (values.motion === "reduced") {
    attributes["data-motion"] = "reduced"
  }
  if (values.density === "compact") {
    attributes["data-density"] = "compact"
  }

  return attributes
}
