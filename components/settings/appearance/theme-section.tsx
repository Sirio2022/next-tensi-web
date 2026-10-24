import type { AppearanceFormValues } from "@/lib/appearance/core/types"
import { THEME_OPTIONS } from "@/lib/appearance/core/preferences"
import type { ThemeMode } from "@/lib/theme/core/appearance"
import type { LucideIcon } from "lucide-react"
import { Monitor, Moon, Sparkles, Sun } from "lucide-react"
import { AppearanceCard } from "./appearance-card"

interface ThemeSectionProps {
  values: AppearanceFormValues
  disabled: boolean
  onChange: (patch: Partial<AppearanceFormValues>) => void
}

const THEME_ICONS: Record<ThemeMode, LucideIcon> = {
  light: Sun,
  dark: Moon,
  auto: Sparkles
}

const THEME_ICON_CLASSES: Record<ThemeMode, string> = {
  light: "text-amber-400",
  dark: "text-accent-text",
  auto: "text-amber-300"
}

/**
 * Bloque "Tema de la Aplicación" (SPEC 22). Grupo de radios nativos: las
 * flechas del teclado cambian de opción y el valor se previsualiza al instante.
 */
export function ThemeSection({
  values,
  disabled,
  onChange
}: Readonly<ThemeSectionProps>) {
  return (
    <AppearanceCard
      title="Tema de la Aplicación"
      description="Elige entre tema claro, oscuro o automático según la configuración de tu sistema"
      icon={Monitor}
    >
      <fieldset disabled={disabled}>
        <legend className="sr-only">Tema de la aplicación</legend>

        <div className="grid grid-cols-1 gap-3 pt-1 sm:grid-cols-3">
          {THEME_OPTIONS.map((option) => {
            const Icon = THEME_ICONS[option.value]
            const isSelected = values.theme === option.value

            return (
              <label
                key={option.value}
                className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border p-4 text-center transition has-focus-visible:ring-2 has-focus-visible:ring-focus has-focus-visible:ring-offset-2 has-focus-visible:ring-offset-surface ${
                  isSelected
                    ? "border-accent bg-accent-soft/60"
                    : "border-line bg-surface/60 hover:border-line-strong"
                }`}
              >
                <input
                  type="radio"
                  name="appearance-theme"
                  value={option.value}
                  checked={isSelected}
                  onChange={() => onChange({ theme: option.value })}
                  className="sr-only"
                />
                <Icon
                  className={`size-5 ${THEME_ICON_CLASSES[option.value]}`}
                  aria-hidden
                />
                <span className="text-xs font-bold text-fg">
                  {option.label}
                </span>
                <span className="text-[10px] text-fg-muted">
                  {option.description}
                </span>
              </label>
            )
          })}
        </div>
      </fieldset>
    </AppearanceCard>
  )
}
