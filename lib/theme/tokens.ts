/**
 * Espejo en TypeScript de los tokens de diseño de Tensi (SPEC 17 + SPEC 21).
 *
 * La fuente que pinta la web sigue siendo `app/globals.css`; este archivo
 * duplica esos valores para que la futura app Expo (React Native) pueda
 * consumirlos sin depender del CSS. Mantén ambos lados sincronizados: si
 * cambias un color, una densidad o un acento, actualiza también
 * `app/globals.css`.
 *
 * Nombres: cada token CSS `--color-foo-bar` se expone aquí como `fooBar`
 * (`--color-fg-muted` → `fgMuted`). Los tokens de densidad replican
 * `--density-*` (`--spacing-card/row/gap/section`).
 */
import type { AccentColor, DensityPreference } from "./core/appearance"

/** Paleta de marca (identidad Tensi), independiente del tema. */
export const COLOR_TOKENS = {
  tensi50: "#f0f7ff",
  tensi400: "#38bdf8",
  tensi500: "#06b6d4",
  tensi600: "#0284c7",
  tensi700: "#0369a1",
  tensiViolet: "#8b5cf6",
  tensiRose: "#f43f5e",
  tensiDark: "#030712",
  tensiCard: "#0f172a",
  background: "#030712",
  foreground: "#f1f5f9"
} as const

/** px por unidad de la escala de espaciado (--spacing 0.25rem con root 16px). */
export const SPACING_UNIT = 4

export type ThemeName = "dark" | "light"

/** Tokens de un acento en un tema. */
export interface AccentTokens {
  /** `--accent`. */
  accent: string
  /** `--accent-hover`. */
  hover: string
  /** `--accent-text` (acento legible como texto sobre la superficie). */
  text: string
  /** `--accent-fg` (texto sobre el color de acento). */
  fg: string
  /** `--focus` (anillo de foco; sigue al acento). */
  focus: string
  /** `--accent-soft` = acento al 12 %. */
  soft: string
  /** `--accent-line` = acento al 32 %. */
  line: string
}

/** Tokens semánticos de un tema. */
export interface ThemeTokens {
  surface: string
  card: string
  cardMuted: string
  line: string
  lineStrong: string
  fg: string
  fgMuted: string
  fgSubtle: string
  fgInverted: string
  focus: string
  chartGrid: string
  chartAxis: string
  chartTooltip: string
  chartTooltipLine: string
  chartSystolic: string
  chartDiastolic: string
  /** Tonos clínicos (`--tone-*`), independientes del acento. */
  tones: {
    amber: string
    sky: string
    emerald: string
    orange: string
    rose: string
    purple: string
  }
  accents: Record<AccentColor, AccentTokens>
}

function accentTokens(
  accent: string,
  hover: string,
  text: string,
  fg: string,
  focus: string
): AccentTokens {
  return {
    accent,
    hover,
    text,
    fg,
    focus,
    soft: `color-mix(in oklab, ${accent} 12%, transparent)`,
    line: `color-mix(in oklab, ${accent} 32%, transparent)`
  }
}

/** Valores por tema; el oscuro es el default de `:root` en `globals.css`. */
export const THEME_TOKENS: Record<ThemeName, ThemeTokens> = {
  dark: {
    surface: "#030712",
    card: "#0f172a",
    cardMuted: "#1e293b",
    line: "#1e293b",
    lineStrong: "#334155",
    fg: "#f1f5f9",
    fgMuted: "#94a3b8",
    fgSubtle: "#7c8ba1",
    fgInverted: "#020617",
    focus: "#38bdf8",
    chartGrid: "#1e293b",
    chartAxis: "#64748b",
    chartTooltip: "#0f172a",
    chartTooltipLine: "#1e293b",
    chartSystolic: "#fb7185",
    chartDiastolic: "#38bdf8",
    tones: {
      amber: "#fbbf24",
      sky: "#7dd3fc",
      emerald: "#6ee7b7",
      orange: "#fdba74",
      rose: "#fda4af",
      purple: "#c4b5fd"
    },
    accents: {
      blue: accentTokens("#0284c7", "#0ea5e9", "#38bdf8", "#020617", "#38bdf8"),
      green: accentTokens(
        "#10b981",
        "#34d399",
        "#34d399",
        "#020617",
        "#34d399"
      ),
      purple: accentTokens(
        "#8b5cf6",
        "#a78bfa",
        "#a78bfa",
        "#020617",
        "#a78bfa"
      ),
      red: accentTokens("#f43f5e", "#fb7185", "#fb7185", "#020617", "#fb7185")
    }
  },
  light: {
    surface: "#f8fafc",
    card: "#ffffff",
    cardMuted: "#f1f5f9",
    line: "#e2e8f0",
    lineStrong: "#cbd5e1",
    fg: "#0f172a",
    fgMuted: "#334155",
    fgSubtle: "#475569",
    fgInverted: "#f8fafc",
    focus: "#0284c7",
    chartGrid: "#e2e8f0",
    chartAxis: "#64748b",
    chartTooltip: "#ffffff",
    chartTooltipLine: "#e2e8f0",
    chartSystolic: "#e11d48",
    chartDiastolic: "#0284c7",
    tones: {
      amber: "#92400e",
      sky: "#0369a1",
      emerald: "#047857",
      orange: "#c2410c",
      rose: "#be123c",
      purple: "#6d28d9"
    },
    accents: {
      blue: accentTokens("#0284c7", "#0369a1", "#0369a1", "#020617", "#0284c7"),
      green: accentTokens(
        "#059669",
        "#047857",
        "#047857",
        "#020617",
        "#059669"
      ),
      purple: accentTokens(
        "#7c3aed",
        "#6d28d9",
        "#6d28d9",
        "#ffffff",
        "#7c3aed"
      ),
      red: accentTokens("#e11d48", "#be123c", "#be123c", "#ffffff", "#e11d48")
    }
  }
}

/** Tokens de densidad (`--density-*` / `--spacing-card|row|gap|section`). */
export interface DensityTokens {
  cardPadding: string
  rowPadding: string
  gap: string
  sectionGap: string
}

export const DENSITY_TOKENS: Record<DensityPreference, DensityTokens> = {
  comfortable: {
    cardPadding: "1.5rem",
    rowPadding: "0.75rem",
    gap: "1rem",
    sectionGap: "2rem"
  },
  compact: {
    cardPadding: "1rem",
    rowPadding: "0.5rem",
    gap: "0.75rem",
    sectionGap: "1.25rem"
  }
}
