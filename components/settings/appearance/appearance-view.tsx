"use client"

import { FormError } from "@/components/auth/form-error"
import type { AppearancePreferences } from "@/lib/appearance/core/types"
import { useAppearanceForm } from "@/lib/appearance/hooks/use-appearance-form"
import { AdvancedSection } from "./advanced-section"
import { AppearanceHeader } from "./appearance-header"
import { ColorSchemeSection } from "./color-scheme-section"
import { LanguageRegionSection } from "./language-region-section"
import { ThemeSection } from "./theme-section"

interface AppearanceViewProps {
  preferences: AppearancePreferences
}

/**
 * Vista cliente de la sección Apariencia (SPEC 22). Presentacional: el estado,
 * la preview, la validación y el `PATCH` viven en `useAppearanceForm`.
 */
export function AppearanceView({
  preferences
}: Readonly<AppearanceViewProps>) {
  const { values, onChange, onSubmit, isDirty, isSaving, rootError } =
    useAppearanceForm(preferences)

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      aria-busy={isSaving}
      className="space-y-4"
    >
      <AppearanceHeader isDirty={isDirty} isSaving={isSaving} />
      <FormError message={rootError} />

      <ThemeSection values={values} disabled={isSaving} onChange={onChange} />
      <LanguageRegionSection
        values={values}
        disabled={isSaving}
        onChange={onChange}
      />
      <ColorSchemeSection
        values={values}
        disabled={isSaving}
        onChange={onChange}
      />
      <AdvancedSection
        values={values}
        disabled={isSaving}
        onChange={onChange}
      />
    </form>
  )
}
