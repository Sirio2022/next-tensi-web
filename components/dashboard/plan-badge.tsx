import { Badge } from '@/components/ui/badge'
import type { Plan } from '@/lib/auth/types'

interface PlanBadgeProps {
  plan: Plan
}

/** Badge del plan del usuario. Free es neutro; Premium, ámbar con punto pulsante. */
export function PlanBadge({ plan }: Readonly<PlanBadgeProps>) {
  const isPremium = plan === 'PREMIUM'

  return (
    <Badge tone={isPremium ? 'amber' : 'neutral'}>
      <span
        className={`size-1.5 rounded-full ${
          isPremium ? 'animate-pulse bg-amber-400' : 'bg-slate-400'
        }`}
        aria-hidden="true"
      />
      <span>{isPremium ? 'Plan Premium' : 'Plan Free'}</span>
    </Badge>
  )
}
