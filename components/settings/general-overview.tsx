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
  birthDate: <Calendar className="size-3 text-slate-400" aria-hidden />,
  weight: <Scale className="size-3 text-slate-400" aria-hidden />,
  height: <Ruler className="size-3 text-slate-400" aria-hidden />,
  gender: <Heart className="size-3 text-slate-400" aria-hidden />
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
      <Card className="space-y-4 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-800/80 pb-3">
          <div>
            <h2 className="flex items-center gap-2 text-sm font-bold text-white">
              <User className="size-4 text-slate-300" aria-hidden />
              Información Personal
            </h2>
            <p className="mt-0.5 text-[11px] text-slate-400">
              Vista general de tu perfil e información médica
            </p>
          </div>
          <AppLink
            href={"/dashboard/settings/profile" as AppLinkHref}
            className="inline-flex items-center gap-1.5 rounded-lg bg-tensi-600 px-3 py-1.5 text-xs font-semibold text-white shadow-md shadow-tensi-600/20 transition hover:bg-tensi-500 focus-visible:ring-2 focus-visible:ring-tensi-400 focus-visible:outline-none"
          >
            <Edit3 className="size-3.5" aria-hidden />
            Editar Perfil Completo
            <ExternalLink className="size-3" aria-hidden />
          </AppLink>
        </div>

        <div className="flex flex-col items-start gap-4 rounded-xl border border-slate-800/80 bg-slate-950/60 p-4 sm:flex-row sm:items-center">
          {user.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.avatarUrl}
              alt={`Avatar de ${summary.displayName}`}
              className="size-12 shrink-0 rounded-full object-cover ring-2 ring-slate-700"
            />
          ) : (
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-tensi-400 to-tensi-600 text-sm font-bold text-white">
              {getUserInitials(user)}
            </span>
          )}

          <div className="min-w-0 space-y-1">
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-bold text-white">
                {summary.displayName}
              </h3>
              {isPremium ? (
                <Crown className="size-3.5 text-amber-400" aria-hidden />
              ) : null}
            </div>
            {summary.email ? (
              <p className="text-xs text-slate-400">{summary.email}</p>
            ) : null}

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-[11px] text-slate-300">
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
      <Card className="space-y-3 p-5">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-bold text-white">
            <Activity className="size-4 text-slate-300" aria-hidden />
            Información Médica
          </h2>
          <p className="mt-0.5 text-[11px] text-slate-400">
            Medicamentos e información relevante para el análisis de presión
            arterial
          </p>
        </div>

        <div className="pt-1">
          <p className="mb-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
            Medicamentos Actuales
          </p>
          {user.medications.length > 0 ? (
            <ul className="flex flex-wrap gap-2">
              {user.medications.map((medication) => (
                <li
                  key={medication}
                  className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-800 px-3 py-1 text-xs font-medium text-slate-200"
                >
                  <Pill className="size-3 text-slate-400" aria-hidden />
                  {medication}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-500">
              Sin medicamentos registrados.
            </p>
          )}
        </div>
      </Card>

      {/* Acceso Rápido */}
      <Card className="space-y-3 p-5">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-bold text-white">
            <LinkIcon className="size-4 text-slate-300" aria-hidden />
            Acceso Rápido
          </h2>
          <p className="mt-0.5 text-[11px] text-slate-400">
            Enlaces directos para gestionar tu perfil
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 pt-1 sm:grid-cols-2">
          <AppLink
            href={"/dashboard/settings/profile" as AppLinkHref}
            className="group flex items-center gap-3 rounded-xl border border-slate-800/80 bg-slate-950/60 p-3 transition hover:border-slate-600 focus-visible:ring-2 focus-visible:ring-tensi-400 focus-visible:outline-none"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-tensi-500/10 text-tensi-400 transition group-hover:bg-tensi-600 group-hover:text-white">
              <Edit3 className="size-4" aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="block text-xs font-bold text-white">
                Editar Perfil Completo
              </span>
              <span className="mt-0.5 block text-[10px] text-slate-400">
                Actualizar información personal y médica
              </span>
            </span>
          </AppLink>

          <AppLink
            href={"/dashboard/settings/profile?tab=password" as AppLinkHref}
            className="group flex items-center gap-3 rounded-xl border border-slate-800/80 bg-slate-950/60 p-3 transition hover:border-slate-600 focus-visible:ring-2 focus-visible:ring-tensi-400 focus-visible:outline-none"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 transition group-hover:bg-amber-500 group-hover:text-slate-950">
              <Lock className="size-4" aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="block text-xs font-bold text-white">
                Cambiar Contraseña
              </span>
              <span className="mt-0.5 block text-[10px] text-slate-400">
                Actualizar credenciales de seguridad
              </span>
            </span>
          </AppLink>
        </div>
      </Card>

      {/* Información de Cuenta */}
      <Card className="space-y-4 p-5">
        <h2 className="flex items-center gap-2 text-sm font-bold text-white">
          <Info className="size-4 text-slate-300" aria-hidden />
          Información de Cuenta
        </h2>

        <div className="grid grid-cols-1 gap-4 text-xs sm:grid-cols-2">
          <div>
            <span className="mb-1 block text-[10px] font-semibold text-slate-400">
              Usuario ID
            </span>
            <p className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 font-mono text-xs break-all text-slate-400">
              {account.userId}
            </p>
          </div>

          <div>
            <span className="mb-1 block text-[10px] font-semibold text-slate-400">
              Tipo de Plan
            </span>
            <p
              className={`flex items-center gap-1 pt-2 text-xs font-bold ${
                isPremium ? "text-amber-400" : "text-slate-300"
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
          <span className="mb-1 block text-[10px] font-semibold text-slate-400">
            Autenticación
          </span>
          <p className="flex items-center gap-2 text-xs font-medium text-slate-300">
            <CreditCard className="size-3.5 text-slate-400" aria-hidden />
            {account.authMethod}
          </p>
        </div>
      </Card>
    </div>
  )
}
