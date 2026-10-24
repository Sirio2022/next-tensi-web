import {
  DATE_FORMAT_LABELS,
  LANGUAGE_OPTIONS,
  deriveDateFormat
} from "@/lib/appearance/core/preferences"
import type {
  AppearanceFormValues,
  AppearanceLanguage
} from "@/lib/appearance/core/types"
import { Globe } from "lucide-react"
import { AppearanceCard } from "./appearance-card"

interface LanguageRegionSectionProps {
  values: AppearanceFormValues
  disabled: boolean
  onChange: (patch: Partial<AppearanceFormValues>) => void
}

const FIELD_CLASSES =
  "w-full rounded-xl border border-line bg-surface/80 px-3 py-2 text-xs text-fg transition focus:border-accent focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"

const LABEL_CLASSES =
  "mb-1.5 block text-[10px] font-bold tracking-wider text-fg-muted uppercase"

const HELP_CLASSES = "mt-1 text-[10px] text-fg-muted"

/**
 * Bloque "Idioma y Región" (SPEC 22). English se muestra deshabilitado con su
 * nota y el formato de fecha se deriva del idioma, sin edición manual.
 */
export function LanguageRegionSection({
  values,
  disabled,
  onChange
}: Readonly<LanguageRegionSectionProps>) {
  const dateFormatLabel = DATE_FORMAT_LABELS[deriveDateFormat(values.language)]

  return (
    <AppearanceCard
      title="Idioma y Región"
      description="Configura el idioma de la interfaz y formatos regionales"
      icon={Globe}
    >
      <div className="grid grid-cols-1 gap-4 pt-1 sm:grid-cols-2">
        <div>
          <label htmlFor="appearance-language" className={LABEL_CLASSES}>
            Idioma de la interfaz
          </label>
          <select
            id="appearance-language"
            value={values.language}
            disabled={disabled}
            aria-describedby="appearance-language-help"
            onChange={(event) => {
              const language = event.target.value as AppearanceLanguage
              onChange({ language, dateFormat: deriveDateFormat(language) })
            }}
            className={FIELD_CLASSES}
          >
            {LANGUAGE_OPTIONS.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.note
                  ? `${option.label} — ${option.note}`
                  : option.label}
              </option>
            ))}
          </select>
          <p id="appearance-language-help" className={HELP_CLASSES}>
            De momento la interfaz solo está disponible en español.
          </p>
        </div>

        <div>
          <label htmlFor="appearance-date-format" className={LABEL_CLASSES}>
            Formato de fecha
          </label>
          <select
            id="appearance-date-format"
            value={dateFormatLabel}
            disabled
            aria-describedby="appearance-date-format-help"
            className={FIELD_CLASSES}
          >
            <option value={DATE_FORMAT_LABELS["DD/MM/YYYY"]}>
              {DATE_FORMAT_LABELS["DD/MM/YYYY"]} (Español)
            </option>
            <option value={DATE_FORMAT_LABELS["MM/DD/YYYY"]}>
              {DATE_FORMAT_LABELS["MM/DD/YYYY"]} (English)
            </option>
          </select>
          <p id="appearance-date-format-help" className={HELP_CLASSES}>
            Se establece automáticamente según el idioma.
          </p>
        </div>
      </div>
    </AppearanceCard>
  )
}
