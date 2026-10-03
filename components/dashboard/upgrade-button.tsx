"use client"

import { Button } from "@/components/ui/button"
import { scrollToUpgradeBanner } from "@/lib/dashboard/scroll-to-upgrade"
import type { Plan } from "@/lib/auth/types"
import { Zap } from "lucide-react"

interface UpgradeButtonProps {
  plan: Plan
}

/**
 * CTA de upgrade del header. Solo se muestra en el plan Free; en Premium no
 * hay nada que mejorar (la spec de Premium reutiliza este mismo componente).
 */
export function UpgradeButton({ plan }: Readonly<UpgradeButtonProps>) {
  if (plan === "PREMIUM") return null

  return (
    <span className="hidden sm:inline-flex">
      <Button tone="amber" size="sm" onClick={scrollToUpgradeBanner}>
        <Zap className="size-3.5" />
        Mejorar Plan
      </Button>
    </span>
  )
}
