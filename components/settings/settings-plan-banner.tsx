"use client"

import { AppLink } from "@/components/ui/app-link"
import { buttonClasses } from "@/components/ui/button"
import type { Plan } from "@/lib/auth/types"
import { Crown } from "lucide-react"
import type { ComponentProps } from "react"

type AppLinkHref = ComponentProps<typeof AppLink>["href"]

interface SettingsPlanBannerProps {
  plan: Plan
}

/**
 * Banner inferior del sub-sidebar de Configuración (SPEC 18). Premium ve el
 * estado "Plan Premium Activo" (solo informativo); Free ve el CTA de upgrade que
 * lleva a "Mi Plan". Usa `AppLink` (SPEC 17).
 */
export function SettingsPlanBanner({
  plan
}: Readonly<SettingsPlanBannerProps>) {
  if (plan === "PREMIUM") {
    return (
      <div className="rounded-lg border border-amber-500/30 bg-linear-to-r from-amber-500/10 via-amber-500/20 to-amber-500/10 p-2.5 text-center">
        <span className="flex items-center justify-center gap-1.5 text-xs font-bold text-amber-400">
          <Crown className="size-3.5" aria-hidden />
          Plan Premium Activo
        </span>
      </div>
    )
  }

  return (
    <AppLink
      href={"/dashboard/settings/plan" as AppLinkHref}
      className={buttonClasses({
        tone: "amber",
        size: "sm",
        className: "w-full"
      })}
    >
      <Crown className="size-3.5" aria-hidden />
      Actualizar a Premium
    </AppLink>
  )
}
