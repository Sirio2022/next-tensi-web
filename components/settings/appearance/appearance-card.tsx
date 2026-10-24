import { Card } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

interface AppearanceCardProps {
  title: string
  description: string
  icon: LucideIcon
  children: ReactNode
}

/**
 * Tarjeta base de la sección Apariencia (SPEC 22). Mismo lenguaje visual que
 * las tarjetas de Notificaciones, sin estado propio.
 */
export function AppearanceCard({
  title,
  description,
  icon: Icon,
  children
}: Readonly<AppearanceCardProps>) {
  return (
    <Card className="space-y-4 p-card">
      <div>
        <h3 className="flex items-center gap-2 text-sm font-bold text-fg">
          <Icon className="size-4 text-accent-text" aria-hidden />
          {title}
        </h3>
        <p className="mt-0.5 text-[11px] text-fg-muted">{description}</p>
      </div>
      {children}
    </Card>
  )
}
