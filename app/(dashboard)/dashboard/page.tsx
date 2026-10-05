import { BpRangesReference } from "@/components/dashboard/bp-ranges-reference"
import { EmptyReadingsCard } from "@/components/dashboard/empty-readings-card"
import { LastReadingCard } from "@/components/dashboard/last-reading-card"
import { MedicalDisclaimer } from "@/components/dashboard/medical-disclaimer"
import { PremiumAnalyticsTeaser } from "@/components/dashboard/premium-analytics-teaser"
import { ReadingsLimitCard } from "@/components/dashboard/readings-limit-card"
import { ReadingsTrendChart } from "@/components/dashboard/readings-trend-chart"
import { UpgradeBanner } from "@/components/dashboard/upgrade-banner"
import { ButtonLink } from "@/components/ui/button-link"
import { verifySession } from "@/lib/auth/dal"
import { getReadingsForSession } from "@/lib/readings/dal"
import { Plus } from "lucide-react"
import type { Metadata } from "next"
import { redirect } from "next/navigation"
import type { ReactNode } from "react"

export const metadata: Metadata = {
  title: "Dashboard"
}

/**
 * Dashboard del plan Free (Server Component). Lee las lecturas con
 * `getReadingsForSession()` (cookie reenviada, memoizado): sin lecturas muestra
 * el estado vacío; con lecturas, la KPI de última medición, la gráfica real de
 * las lecturas visibles, el contador del límite Free y el gancho Premium. Todo
 * lo calcula el back; el front solo presenta.
 */
export default async function DashboardPage() {
  const user = await verifySession()

  if (!user) {
    redirect("/login")
  }

  const isFree = user.plan === "FREE"
  const response = isFree ? await getReadingsForSession() : null
  const readings = response?.data ?? []
  const meta = response?.meta ?? null
  const hasReadings = (meta?.total ?? 0) > 0
  const lastReading = readings[0]
  let dashboardContent: ReactNode

  if (!isFree) {
    dashboardContent = <BpRangesReference />
  } else if (hasReadings && meta) {
    dashboardContent = (
      <>
        {lastReading ? <LastReadingCard reading={lastReading} /> : null}
        <ReadingsTrendChart readings={readings} />
        <ReadingsLimitCard meta={meta} />
        <PremiumAnalyticsTeaser />
        <UpgradeBanner />
        <BpRangesReference />
      </>
    )
  } else {
    dashboardContent = (
      <>
        <EmptyReadingsCard />
        <UpgradeBanner />
      </>
    )
  }

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

        <ButtonLink href="/dashboard/new-reading">
          <Plus className="size-4" />
          Registrar Nueva Lectura
        </ButtonLink>
      </div>

      {dashboardContent}
    </>
  )
}
