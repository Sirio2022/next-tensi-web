import type { AuthUser } from '@/lib/auth/types'
import { PlanBadge } from './plan-badge'
import { UpgradeButton } from './upgrade-button'
import { UserProfile } from './user-profile'

interface DashboardHeaderProps {
  user: AuthUser
}

/**
 * Header del área de contenido. Consume el plan y los datos del usuario reales
 * de la sesión y los reparte a `PlanBadge`, `UpgradeButton` y `UserProfile`.
 */
export function DashboardHeader({ user }: Readonly<DashboardHeaderProps>) {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-800/60 bg-slate-950/80 px-6 backdrop-blur-xl">
      <p className="text-sm font-semibold text-slate-200">Panel Principal</p>

      <div className="flex items-center gap-4">
        <PlanBadge plan={user.plan} />
        <UpgradeButton plan={user.plan} />
        <div className="h-4 w-px bg-slate-800" aria-hidden="true" />
        <UserProfile user={user} />
      </div>
    </header>
  )
}
