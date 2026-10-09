/**
 * Espejo en TypeScript de los tokens de diseño de Tensi (SPEC 17).
 *
 * La fuente que pinta la web sigue siendo el bloque `@theme inline` de
 * `app/globals.css`; este archivo duplica esos valores para que la futura app
 * Expo (React Native) pueda consumirlos sin depender del CSS. Mantén ambos
 * lados sincronizados: si cambia un color o la escala de espaciado, actualiza
 * `app/globals.css` y este archivo a la vez.
 *
 * Cuando exista la app Expo, este archivo pasará a ser la fuente única y el
 * `@theme` del CSS se generará a partir de él (ver riesgos de la SPEC 17).
 */
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
