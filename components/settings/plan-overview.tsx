"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type { AuthUser } from "@/lib/auth/types"
import {
  PLAN_FEATURES,
  type PlanFeature
} from "@/lib/settings/core/plan-comparison"
import { usePlanUpgradeDialog } from "@/lib/settings/hooks/use-plan-upgrade-dialog"
import { Check, Crown, X } from "lucide-react"
import type { ReactNode } from "react"
import { PlanUpgradeDialog } from "./plan-upgrade-dialog"

/** Celda de la comparativa: check/equis para booleanos, texto si es un string. */
function renderPlanValue(
  value: PlanFeature["free"],
  planName: string
): ReactNode {
  if (value === true) {
    return (
      <span className="inline-flex items-center justify-center text-emerald-400">
        <Check className="size-4" aria-hidden />
        <span className="sr-only">{`Incluido en ${planName}`}</span>
      </span>
    )
  }

  if (value === false) {
    return (
      <span className="inline-flex items-center justify-center text-slate-600">
        <X className="size-4" aria-hidden />
        <span className="sr-only">{`No incluido en ${planName}`}</span>
      </span>
    )
  }

  return <span className="font-semibold text-slate-200">{value}</span>
}

interface PlanOverviewProps {
  user: AuthUser
}

/**
 * Vista "Mi Plan" de Configuración (SPEC 18): estado del plan actual,
 * comparativa Free vs Premium y CTA que abre el modal nativo "próximamente".
 * Cliente y presentacional; el estado del diálogo vive en
 * `usePlanUpgradeDialog` (SPEC 11) y el CTA `Button` es el disparador que
 * recupera el foco al cerrar.
 */
export function PlanOverview({ user }: Readonly<PlanOverviewProps>) {
  const isPremium = user.plan === "PREMIUM"
  const { open, triggerRef, dialogRef, openDialog, closeDialog, onCancel, onBackdropClick } =
    usePlanUpgradeDialog()

  return (
    <div className="space-y-4">
      {/* Estado del plan */}
      <Card className="relative overflow-hidden p-5">
        <div
          className="pointer-events-none absolute -top-16 -right-16 size-48 rounded-full bg-amber-500/10 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
                <Crown className="size-5" aria-hidden />
              </span>
              <div>
                <p className="text-xs text-slate-400">Tu plan actual</p>
                <p className="text-lg font-bold text-white">
                  {isPremium ? "Plan Premium" : "Plan Free"}
                </p>
              </div>
            </div>
            <p className="max-w-md text-xs/relaxed text-slate-400">
              {isPremium
                ? "Tienes acceso completo a las analíticas, los reportes y todas las funciones premium de Tensi."
                : "Estás en el plan gratuito. Actualiza para desbloquear analíticas, reportes y funciones premium."}
            </p>
          </div>

          {isPremium ? (
            <Badge tone="amber" className="shrink-0">
              <Crown className="size-3.5" aria-hidden />
              Plan Premium Activo
            </Badge>
          ) : (
            <Button
              ref={triggerRef}
              tone="amber"
              onClick={openDialog}
              className="shrink-0"
            >
              <Crown className="size-4" aria-hidden />
              Actualizar a Premium
            </Button>
          )}
        </div>
      </Card>

      {/* Comparativa Free vs Premium */}
      <Card className="p-5">
        <h2 className="text-sm font-bold text-white">Comparación de planes</h2>
        <p className="mt-0.5 text-[11px] text-slate-400">
          Qué incluye cada plan de Tensi
        </p>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <caption className="sr-only">
              Comparación de funciones entre el plan Free y el plan Premium
            </caption>
            <thead>
              <tr className="text-[10px] tracking-wider text-slate-400 uppercase">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Función
                </th>
                <th
                  scope="col"
                  className={`px-3 py-2 text-center font-semibold ${
                    !isPremium ? "text-white" : ""
                  }`}
                >
                  Free
                </th>
                <th
                  scope="col"
                  className={`py-2 pl-3 text-center font-semibold ${
                    isPremium ? "text-amber-400" : ""
                  }`}
                >
                  Premium
                </th>
              </tr>
            </thead>
            <tbody>
              {PLAN_FEATURES.map((feature) => (
                <tr key={feature.label} className="border-t border-slate-800/80">
                  <th
                    scope="row"
                    className="py-3 pr-3 font-medium text-slate-300"
                  >
                    {feature.label}
                  </th>
                  <td className="p-3 text-center">
                    {renderPlanValue(feature.free, "Free")}
                  </td>
                  <td className="py-3 pl-3 text-center">
                    {renderPlanValue(feature.premium, "Premium")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <PlanUpgradeDialog
        open={open}
        dialogRef={dialogRef}
        onClose={closeDialog}
        onCancel={onCancel}
        onBackdropClick={onBackdropClick}
      />
    </div>
  )
}
