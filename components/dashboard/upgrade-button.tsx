'use client'

import { Button } from '@/components/ui/button'
import type { Plan } from '@/lib/auth/types'

/** Desplaza el viewport al banner de upgrade. */
function scrollToUpgradeBanner() {
  document
    .getElementById('upgrade')
    ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

interface UpgradeButtonProps {
  plan: Plan
}

/**
 * CTA de upgrade del header. Solo se muestra en el plan Free; en Premium no
 * hay nada que mejorar (la spec de Premium reutiliza este mismo componente).
 */
export function UpgradeButton({ plan }: Readonly<UpgradeButtonProps>) {
  if (plan === 'PREMIUM') return null

  return (
    <span className="hidden sm:inline-flex">
      <Button tone="amber" size="sm" onClick={scrollToUpgradeBanner}>
        <svg
          className="size-3.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
        Mejorar Plan
      </Button>
    </span>
  )
}
