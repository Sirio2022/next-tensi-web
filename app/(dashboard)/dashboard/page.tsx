import { AnalyticsCtaCard } from "@/components/dashboard/analytics-cta-card"
import { AnalyticsSummaryCards } from "@/components/dashboard/analytics-summary-cards"
import { AnalyticsWeeklyKpis } from "@/components/dashboard/analytics-weekly-kpis"
import { BpRangesReference } from "@/components/dashboard/bp-ranges-reference"
import { EmptyReadingsCard } from "@/components/dashboard/empty-readings-card"
import { LastReadingCard } from "@/components/dashboard/last-reading-card"
import { LastReadingsTable } from "@/components/dashboard/last-readings-table"
import { MedicalDisclaimer } from "@/components/dashboard/medical-disclaimer"
import { PremiumAnalyticsTeaser } from "@/components/dashboard/premium-analytics-teaser"
import { ReadingsLimitCard } from "@/components/dashboard/readings-limit-card"
import { ReadingsTrendChart } from "@/components/dashboard/readings-trend-chart"
import { UpgradeBanner } from "@/components/dashboard/upgrade-banner"
import { ButtonLink } from "@/components/ui/button-link"
import { verifySession } from "@/lib/auth/dal"
import {
  getAnalyticsForSession,
  getTrendForSession,
  getWeeklySummaryForSession
} from "@/lib/readings/analytics.dal"
import { getReadingsForSession } from "@/lib/readings/dal"
import { Plus } from "lucide-react"
import type { Metadata } from "next"
import { redirect } from "next/navigation"
import type { ReactNode } from "react"

export const metadata: Metadata = {
  title: "Dashboard"
}

/**
 * Dashboard (Server Component). La rama Free es la del plan gratuito (última
 * medición, tendencia, límite y gancho Premium). La rama Premium compone la fila
 * de KPIs (última medición + pico, mínima y promedio de 7 días con su variación),
 * el resumen de `GET /analytics`, la tendencia de 30 días y las últimas lecturas
 * con CTA a Análisis. Todo lo calcula el back; el front solo presenta.
 */
export default async function DashboardPage() {
  const user = await verifySession()

  if (!user) {
    redirect("/login")
  }

  const isFree = user.plan === "FREE"
  let dashboardContent: ReactNode

  if (isFree) {
    const response = await getReadingsForSession()
    const readings = response?.data ?? []
    const meta = response?.meta ?? null
    const hasReadings = (meta?.total ?? 0) > 0
    const lastReading = readings[0]

    if (hasReadings && meta) {
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
  } else {
    const [readingsResponse, summary, weekly, trend] = await Promise.all([
      getReadingsForSession(0, 5),
      getAnalyticsForSession(),
      getWeeklySummaryForSession(),
      getTrendForSession("30d")
    ])

    const recentReadings = readingsResponse?.data ?? []
    const lastReading = recentReadings[0]

    dashboardContent = (
      <>
        <section
          aria-label="Resumen de tus mediciones"
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {lastReading ? <LastReadingCard reading={lastReading} /> : null}
          {weekly ? <AnalyticsWeeklyKpis summary={weekly} /> : null}
        </section>

        {summary ? <AnalyticsSummaryCards summary={summary} /> : null}

        <ReadingsTrendChart
          readings={trend ?? []}
          subtitle="Sistólica y diastólica · últimos 30 días"
        />

        {recentReadings.length > 0 ? (
          <LastReadingsTable readings={recentReadings} />
        ) : null}

        <AnalyticsCtaCard />
        <BpRangesReference />
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
