import { ACCENT_OPTIONS } from "@/lib/appearance/core/preferences"
import type { AppearanceFormValues } from "@/lib/appearance/core/types"
import type { AccentColor } from "@/lib/theme/core/appearance"
import { Palette } from "lucide-react"
import { AppearanceCard } from "./appearance-card"

interface ColorSchemeSectionProps {
  values: AppearanceFormValues
  disabled: boolean
  onChange: (patch: Partial<AppearanceFormValues>) => void
}

/** Muestras del mockup; el acento real se aplica vía `data-accent`. */
const ACCENT_SWATCH_CLASSES: Record<AccentColor, string> = {
  blue: "bg-blue-500",
  green: "bg-emerald-500",
  purple: "bg-purple-500",
  red: "bg-rose-500"
}

/**
 * Bloque "Esquema de Colores" (SPEC 22). El acento se implementa de verdad, así
 * que se omite el banner de "futura actualización" del mockup.
 */
export function ColorSchemeSection({
  values,
  disabled,
  onChange
}: Readonly<ColorSchemeSectionProps>) {
  return (
    <AppearanceCard
      title="Esquema de Colores"
      description="Elige el color principal para botones y elementos destacados"
      icon={Palette}
    >
      <fieldset disabled={disabled}>
        <legend className="sr-only">Esquema de colores</legend>

        <div className="grid grid-cols-2 gap-3 pt-1 sm:grid-cols-4">
          {ACCENT_OPTIONS.map((option) => {
            const isSelected = values.accent === option.value

            return (
              <label
                key={option.value}
                className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border p-4 transition has-focus-visible:ring-2 has-focus-visible:ring-focus has-focus-visible:ring-offset-2 has-focus-visible:ring-offset-surface ${
                  isSelected
                    ? "border-accent bg-accent-soft/60"
                    : "border-line bg-surface/60 hover:border-line-strong"
                }`}
              >
                <input
                  type="radio"
                  name="appearance-accent"
                  value={option.value}
                  checked={isSelected}
                  onChange={() => onChange({ accent: option.value })}
                  className="sr-only"
                />
                <span
                  aria-hidden
                  className={`size-5 rounded-full ${ACCENT_SWATCH_CLASSES[option.value]}`}
                />
                <span
                  className={`text-xs ${
                    isSelected
                      ? "font-bold text-fg"
                      : "font-semibold text-fg-muted"
                  }`}
                >
                  {option.label}
                </span>
              </label>
            )
          })}
        </div>
      </fieldset>
    </AppearanceCard>
  )
}
