"use client"

import { AppLink } from "@/components/ui/app-link"
import { buttonClasses } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { LockBadge } from "@/components/ui/lock-badge"
import { Crown } from "lucide-react"
import type { ComponentProps, ReactNode } from "react"

/** Href aceptado por `AppLink` (tipo `Route` de Next con typedRoutes). */
type AppLinkHref = ComponentProps<typeof AppLink>["href"]

interface PremiumLockedCardProps {
  /** Título del bloque bloqueado. */
  title?: string
  /** Explicación de qué desbloquea Premium. */
  description?: string
  /**
   * Contenido bloqueado que se muestra difuminado y sin interacción (`aria-hidden`).
   * Opcional: si se omite, la tarjeta solo anuncia el candado.
   */
  children?: ReactNode
  /** Texto del CTA de upgrade. */
  ctaLabel?: string
  /**
   * Destino del CTA; por defecto la sección "Mi Plan" del shell. Es `string`
   * (no `Route`) para no acoplar la vista a los tipos de ruta de Next (SPEC 17);
   * el cast a la firma de `AppLink` se hace en el borde web.
   */
  ctaHref?: string
  className?: string
}

/**
 * Tarjeta reutilizable para bloquear un control con el candado dorado y un CTA
 * de upgrade (SPEC 18). Es la mitad de vista del mecanismo cuyo predicado es
 * `isLockedForPlan`: las specs de sección la montan cuando el plan es Free. La
 * usa `AppLink` (SPEC 17) para no depender de `next/link` directamente y poder
 * portarse a DOM components.
 */
export function PremiumLockedCard({
  title = "Función Premium",
  description = "Desbloquea esta opción con Tensi Premium.",
  children,
  ctaLabel = "Actualizar a Premium",
  ctaHref = "/dashboard/settings/plan",
  className = ""
}: Readonly<PremiumLockedCardProps>) {
  return (
    <Card className={`relative overflow-hidden p-6 ${className}`.trim()}>
      <div
        className="pointer-events-none absolute -top-16 -right-16 size-48 rounded-full bg-amber-500/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative z-10 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-100">{title}</h2>
            <p className="mt-0.5 text-xs text-slate-400">{description}</p>
          </div>
          <LockBadge />
        </div>

        {children ? (
          <div
            aria-hidden="true"
            className="pointer-events-none select-none opacity-60 blur-[2px]"
          >
            {children}
          </div>
        ) : null}

        <AppLink
          href={ctaHref as AppLinkHref}
          className={buttonClasses({
            tone: "amber",
            size: "sm",
            className: "w-full sm:w-auto"
          })}
        >
          <Crown className="size-3.5" aria-hidden />
          {ctaLabel}
        </AppLink>
      </div>
    </Card>
  )
}
