"use client"

import { AppLink } from "@/components/ui/app-link"
import { Card } from "@/components/ui/card"
import { getUserInitials } from "@/lib/auth/user"
import type { AuthUser } from "@/lib/auth/types"
import {
  buildAccountSummary,
  buildProfileSummary,
  type ProfileDetailId
} from "@/lib/settings/core/general"
import {
  Activity,
  Calendar,
  CreditCard,
  Crown,
  Edit3,
  ExternalLink,
  Heart,
  Info,
  Link as LinkIcon,
  Lock,
  Pill,
  Ruler,
  Scale,
  User
} from "lucide-react"
import type { ComponentProps, ReactNode } from "react"

type AppLinkHref = ComponentProps<typeof AppLink>["href"]

/** Iconos de los detalles del resumen de perfil, por `ProfileDetailId`. */
const DETAIL_ICONS: Record<ProfileDetailId, ReactNode> = {
  birthDate: <Calendar className="size-3 text-fg-muted" aria-hidden />,
  weight: <Scale className="size-3 text-fg-muted" aria-hidden />,
  height: <Ruler className="size-3 text-fg-muted" aria-hidden />,
  gender: <Heart className="size-3 text-fg-muted" aria-hidden />
}

interface GeneralOverviewProps {
  user: AuthUser
}

/**
 * Vista "Vista General" de Configuración (SPEC 18): resumen de perfil,
 * información médica, acceso rápido e información de cuenta. Cliente y
 * presentacional: toda la derivación viene de `lib/settings/core/general`, y la
 * navegación usa `AppLink` (SPEC 17) para poder portarse a DOM components.
 */
export function GeneralOverview({ user }: Readonly<GeneralOverviewProps>) {
  const summary = buildProfileSummary(user)
  const account = buildAccountSummary(user)
  const isPremium = user.plan === "PREMIUM"

  return (
    <div className="space-y-4">
      {/* Información Personal */}
      <Card className="space-y-4 p-card">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line pb-3">
          <div>
            <h2 className="flex items-center gap-2 text-sm font-bold text-fg">
              <User className="size-4 text-fg-muted" aria-hidden />
              Información Personal
            </h2>
            <p className="mt-0.5 text-[11px] text-fg-muted">
              Vista general de tu perfil e información médica
            </p>
          </div>
          <AppLink
            href={"/dashboard/settings/profile" as AppLinkHref}
            className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-accent-fg shadow-md shadow-accent/20 transition hover:bg-accent-hover focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-none"
          >
            <Edit3 className="size-3.5" aria-hidden />
            Editar Perfil Completo
            <ExternalLink className="size-3" aria-hidden />
          </AppLink>
        </div>

        <div className="flex flex-col items-start gap-4 rounded-xl border border-line bg-surface/60 p-4 sm:flex-row sm:items-center">
          {user.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.avatarUrl}
              alt={`Avatar de ${summary.displayName}`}
              className="size-12 shrink-0 rounded-full object-cover ring-2 ring-line-strong"
            />
          ) : (
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-accent-hover to-accent text-sm font-bold text-accent-fg">
              {getUserInitials(user)}
            </span>
          )}

          <div className="min-w-0 space-y-1">
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-bold text-fg">
                {summary.displayName}
              </h3>
              {isPremium ? (
                <Crown className="size-3.5 text-tone-amber" aria-hidden />
              ) : null}
            </div>
            {summary.email ? (
              <p className="text-xs text-fg-muted">{summary.email}</p>
            ) : null}

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-[11px] text-fg-muted">
              {summary.details.map((detail) => (
                <span key={detail.id} className="flex items-center gap-1">
                  {DETAIL_ICONS[detail.id]}
                  <span className="sr-only">{detail.label}: </span>
                  {detail.value}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Información Médica */}
      <Card className="space-y-3 p-card">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-bold text-fg">
            <Activity className="size-4 text-fg-muted" aria-hidden />
            Información Médica
          </h2>
          <p className="mt-0.5 text-[11px] text-fg-muted">
            Medicamentos e información relevante para el análisis de presión
            arterial
          </p>
        </div>

        <div className="pt-1">
          <p className="mb-2 text-[10px] font-bold tracking-wider text-fg-muted uppercase">
            Medicamentos Actuales
          </p>
          {user.medications.length > 0 ? (
            <ul className="flex flex-wrap gap-2">
              {user.medications.map((medication) => (
                <li
                  key={medication}
                  className="inline-flex items-center gap-1.5 rounded-full border border-line-strong bg-card-muted px-3 py-1 text-xs font-medium text-fg"
                >
                  <Pill className="size-3 text-fg-muted" aria-hidden />
                  {medication}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-fg-subtle">
              Sin medicamentos registrados.
            </p>
          )}
        </div>
      </Card>

      {/* Acceso Rápido */}
      <Card className="space-y-3 p-card">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-bold text-fg">
            <LinkIcon className="size-4 text-fg-muted" aria-hidden />
            Acceso Rápido
          </h2>
          <p className="mt-0.5 text-[11px] text-fg-muted">
            Enlaces directos para gestionar tu perfil
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 pt-1 sm:grid-cols-2">
          <AppLink
            href={"/dashboard/settings/profile" as AppLinkHref}
            className="group flex items-center gap-3 rounded-xl border border-line bg-surface/60 p-3 transition hover:border-line-strong focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-none"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent-text transition group-hover:bg-accent group-hover:text-accent-fg">
              <Edit3 className="size-4" aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="block text-xs font-bold text-fg">
                Editar Perfil Completo
              </span>
              <span className="mt-0.5 block text-[10px] text-fg-muted">
                Actualizar información personal y médica
              </span>
            </span>
          </AppLink>

          <AppLink
            href={"/dashboard/settings/profile?tab=password" as AppLinkHref}
            className="group flex items-center gap-3 rounded-xl border border-line bg-surface/60 p-3 transition hover:border-line-strong focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-none"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-tone-amber transition group-hover:bg-amber-500 group-hover:text-amber-950">
              <Lock className="size-4" aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="block text-xs font-bold text-fg">
                Cambiar Contraseña
              </span>
              <span className="mt-0.5 block text-[10px] text-fg-muted">
                Actualizar credenciales de seguridad
              </span>
            </span>
          </AppLink>
        </div>
      </Card>

      {/* Información de Cuenta */}
      <Card className="space-y-4 p-card">
        <h2 className="flex items-center gap-2 text-sm font-bold text-fg">
          <Info className="size-4 text-fg-muted" aria-hidden />
          Información de Cuenta
        </h2>

        <div className="grid grid-cols-1 gap-4 text-xs sm:grid-cols-2">
          <div>
            <span className="mb-1 block text-[10px] font-semibold text-fg-muted">
              Usuario ID
            </span>
            <p className="rounded-lg border border-line bg-surface px-3 py-2 font-mono text-xs break-all text-fg-muted">
              {account.userId}
            </p>
          </div>

          <div>
            <span className="mb-1 block text-[10px] font-semibold text-fg-muted">
              Tipo de Plan
            </span>
            <p
              className={`flex items-center gap-1 pt-2 text-xs font-bold ${
                isPremium ? "text-tone-amber" : "text-fg-muted"
              }`}
            >
              {isPremium ? (
                <Crown className="size-3.5" aria-hidden />
              ) : null}
              {account.planLabel}
            </p>
          </div>
        </div>

        <div className="pt-1">
          <span className="mb-1 block text-[10px] font-semibold text-fg-muted">
            Autenticación
          </span>
          <p className="flex items-center gap-2 text-xs font-medium text-fg-muted">
            <CreditCard className="size-3.5 text-fg-muted" aria-hidden />
            {account.authMethod}
          </p>
        </div>
      </Card>
    </div>
  )
}
