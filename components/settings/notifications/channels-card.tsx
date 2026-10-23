"use client"

import { Switch } from "@/components/ui/switch"
import type { NotificationPreferencesFormValues } from "@/lib/notifications/core/schemas"
import { Smartphone } from "lucide-react"
import { NotificationCard } from "./notification-card"

interface ChannelsCardProps {
  values: NotificationPreferencesFormValues
  disabled: boolean
  /** Usuarios OAuth sin email: el canal Email se deshabilita con nota. */
  emailAvailable: boolean
  onChange: (patch: Partial<NotificationPreferencesFormValues>) => void
}

const TILE_CLASSES =
  "flex items-start justify-between gap-3 rounded-xl border border-slate-800/60 bg-slate-950/60 p-3.5"

/** Canales de Notificación (SPEC 20). */
export function ChannelsCard({
  values,
  disabled,
  emailAvailable,
  onChange
}: Readonly<ChannelsCardProps>) {
  return (
    <NotificationCard
      title="Canales de Notificación"
      description="Elige cómo prefieres recibir las notificaciones"
      icon={Smartphone}
      iconClassName="size-4 text-tensi-400"
    >
      <div className="grid grid-cols-1 gap-3 pt-1 sm:grid-cols-3">
        <div className={TILE_CLASSES}>
          <Switch
            id="notifications-channel-email"
            checked={values.channelEmail}
            onCheckedChange={(checked) => onChange({ channelEmail: checked })}
            label="Email"
            description="Notificaciones por correo"
            note={
              emailAvailable
                ? undefined
                : "Tu cuenta no tiene un email registrado."
            }
            disabled={disabled || !emailAvailable}
            size="sm"
            className="w-full"
          />
        </div>

        <div className={TILE_CLASSES}>
          <Switch
            id="notifications-channel-push"
            checked={values.channelPush}
            onCheckedChange={(checked) => onChange({ channelPush: checked })}
            label="Push"
            description="Notificaciones del navegador"
            note="Disponible próximamente"
            disabled={disabled}
            size="sm"
            className="w-full"
          />
        </div>

        <div className={TILE_CLASSES}>
          <Switch
            id="notifications-channel-in-app"
            checked={values.channelInApp}
            onCheckedChange={(checked) => onChange({ channelInApp: checked })}
            label="En la App"
            description="Notificaciones internas"
            note="Disponible próximamente"
            disabled={disabled}
            size="sm"
            className="w-full"
          />
        </div>
      </div>
    </NotificationCard>
  )
}
