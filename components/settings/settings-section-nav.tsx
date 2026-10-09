"use client"

import { AppLink } from "@/components/ui/app-link"
import type { Plan } from "@/lib/auth/types"
import { SETTINGS_SECTIONS } from "@/lib/settings/core/sections"
import { useActiveSettingsSection } from "@/lib/settings/hooks/use-active-settings-section"
import { Crown } from "lucide-react"
import type { ComponentProps } from "react"
import { SettingsPlanBanner } from "./settings-plan-banner"
import { SettingsSectionIcon } from "./settings-section-icon"

type AppLinkHref = ComponentProps<typeof AppLink>["href"]

interface SettingsSectionNavProps {
  plan: Plan
}

/**
 * Sub-navegación de Configuración (SPEC 18): las seis secciones en orden, la
 * activa marcada con `aria-current="page"` (resuelta por pathname vía
 * `useActiveSettingsSection`), "Mi Plan" con corona y las futuras con la nota
 * "Pronto". Al pie, el banner de plan. Usa `AppLink` (SPEC 17).
 */
export function SettingsSectionNav({ plan }: Readonly<SettingsSectionNavProps>) {
  const activeId = useActiveSettingsSection()

  return (
    <nav
      aria-label="Secciones de configuración"
      className="space-y-1 rounded-3xl border border-slate-800/80 bg-slate-900/60 p-2 shadow-lg backdrop-blur-xl"
    >
      {SETTINGS_SECTIONS.map((section) => {
        const isActive = section.id === activeId

        return (
          <AppLink
            key={section.id}
            href={section.href as AppLinkHref}
            aria-current={isActive ? "page" : undefined}
            className={`flex items-start gap-3 rounded-xl border p-3 transition focus-visible:ring-2 focus-visible:ring-tensi-400 focus-visible:outline-none ${
              isActive
                ? "border-tensi-500/20 bg-tensi-600/10 text-white"
                : "border-transparent text-slate-300 hover:bg-slate-800/50 hover:text-white"
            }`}
          >
            <span className="mt-0.5 shrink-0">
              <SettingsSectionIcon
                id={section.icon}
                className={section.highlighted ? "size-4 text-amber-400" : "size-4"}
              />
            </span>
            <span className="min-w-0">
              <span className="flex items-center gap-1.5 text-xs font-bold leading-none">
                {section.label}
                {section.highlighted ? (
                  <Crown className="size-3 text-amber-400" aria-hidden />
                ) : null}
                {section.state === "coming-soon" ? (
                  <span className="rounded-full bg-slate-800 px-1.5 py-0.5 text-[9px] font-semibold tracking-wide text-slate-400 uppercase">
                    Pronto
                  </span>
                ) : null}
              </span>
              <span className="mt-1 block text-[10px] leading-tight text-slate-400">
                {section.description}
              </span>
            </span>
          </AppLink>
        )
      })}

      <div className="pt-2">
        <SettingsPlanBanner plan={plan} />
      </div>
    </nav>
  )
}
