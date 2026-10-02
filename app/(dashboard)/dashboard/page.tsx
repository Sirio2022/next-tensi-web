import { BpRangesReference } from "@/components/dashboard/bp-ranges-reference"
import { EmptyReadingsCard } from "@/components/dashboard/empty-readings-card"
import { MedicalDisclaimer } from "@/components/dashboard/medical-disclaimer"
import { UpgradeBanner } from "@/components/dashboard/upgrade-banner"
import { Button } from "@/components/ui/button"
import { verifySession } from "@/lib/auth/dal"
import type { Metadata } from "next"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "Dashboard — Tensi"
}

/**
 * Página del dashboard (Server Component). Compone el contenido del plan Free:
 * aviso médico, título + CTA, estado vacío, banner de upgrade y referencia de
 * rangos. Sin datos dinámicos todavía: con plan Free el estado vacío y el banner
 * se muestran siempre (la vista Premium entra en su propia spec).
 */
export default async function DashboardPage() {
  const user = await verifySession()

  if (!user) {
    redirect("/login")
  }

  const isFree = user.plan === "FREE"

  return (
    <>
      <MedicalDisclaimer />

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white lg:text-3xl">
            Dashboard
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Resumen en tiempo real y estado general de tu salud cardiovascular.
          </p>
        </div>

        <Button>
          <svg
            className="size-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Registrar Nueva Lectura
        </Button>
      </div>

      {isFree ? (
        <>
          <EmptyReadingsCard />
          <UpgradeBanner />
        </>
      ) : null}

      <BpRangesReference />
    </>
  )
}
