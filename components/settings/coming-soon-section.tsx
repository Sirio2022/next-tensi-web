"use client"

import { Card } from "@/components/ui/card"
import type { SettingsIconId } from "@/lib/settings/core/sections"
import { Clock } from "lucide-react"
import { SettingsSectionIcon } from "./settings-section-icon"

interface ComingSoonSectionProps {
  icon: SettingsIconId
  title: string
  description: string
}

/**
 * Placeholder de una sección de Configuración aún no implementada (SPEC 18).
 * Muestra "Disponible próximamente" de forma explícita y sin candado ni CTA de
 * pago, para que no se lea como una función premium. Igual para Free y Premium.
 */
export function ComingSoonSection({
  icon,
  title,
  description
}: Readonly<ComingSoonSectionProps>) {
  return (
    <Card className="flex flex-col items-center gap-4 p-8 text-center">
      <span className="flex size-12 items-center justify-center rounded-2xl bg-slate-800 text-slate-300">
        <SettingsSectionIcon id={icon} className="size-6" />
      </span>

      <div className="space-y-1">
        <h2 className="text-sm font-bold text-white">{title}</h2>
        <p className="text-xs text-slate-400">{description}</p>
      </div>

      <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-800/60 px-3 py-1 text-xs font-semibold text-slate-300">
        <Clock className="size-3.5" aria-hidden />
        Disponible próximamente
      </span>
    </Card>
  )
}
