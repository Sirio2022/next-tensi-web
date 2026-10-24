import { Card } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

interface NotificationCardProps {
  title: string
  description: string
  icon: LucideIcon
  iconClassName: string
  children: ReactNode
}

/** Tarjeta base de la sección Notificaciones (SPEC 20). */
export function NotificationCard({
  title,
  description,
  icon: Icon,
  iconClassName,
  children
}: Readonly<NotificationCardProps>) {
  return (
    <Card className="space-y-4 p-card">
      <div>
        <h3 className="flex items-center gap-2 text-sm font-bold text-fg">
          <Icon className={iconClassName} aria-hidden />
          {title}
        </h3>
        <p className="mt-0.5 text-[11px] text-fg-muted">{description}</p>
      </div>
      {children}
    </Card>
  )
}
