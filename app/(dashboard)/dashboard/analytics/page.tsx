import { AnalyticsCategoryDistribution } from "@/components/dashboard/analytics-category-distribution"
import { AnalyticsCategoryEvolution } from "@/components/dashboard/analytics-category-evolution"
import { AnalyticsCategoryStatsTable } from "@/components/dashboard/analytics-category-stats-table"
import { AnalyticsEmergencyAlerts } from "@/components/dashboard/analytics-emergency-alerts"
import { AnalyticsPeriodAverages } from "@/components/dashboard/analytics-period-averages"
import { AnalyticsPeriodToggle } from "@/components/dashboard/analytics-period-toggle"
import { AnalyticsRangeToggle } from "@/components/dashboard/analytics-range-toggle"
import { AnalyticsSummaryCards } from "@/components/dashboard/analytics-summary-cards"
import { AnalyticsWeeklyKpis } from "@/components/dashboard/analytics-weekly-kpis"
import { MedicalDisclaimer } from "@/components/dashboard/medical-disclaimer"
import { ReadingsTrendChart } from "@/components/dashboard/readings-trend-chart"
import { verifySession } from "@/lib/auth/dal"
import {
  parseAnalyticsPeriod,
  parseAnalyticsRange
} from "@/lib/readings/analytics"
import {
  getAnalyticsForSession,
  getCategoryDistributionForSession,
  getCategoryStatsForSession,
  getPeriodAveragesForSession,
  getTrendForSession,
  getWeeklySummaryForSession
} from "@/lib/readings/analytics.dal"
import type { Metadata } from "next"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "Análisis"
}

/**
 * Pantalla Análisis (solo Premium). Server Component: valida la sesión y el plan
 * antes de llamar a ningún endpoint `/analytics` (un Free va al banner de
 * upgrade). El rango (`?range`) y la granularidad (`?period`) viven en la URL y
 * se resuelven con parsers puros. Todas las secciones se alimentan del back vía
 * DAL memoizado en un único `Promise.all`; el front solo presenta.
 */
export default async function AnalyticsPage({
  searchParams
}: Readonly<PageProps<"/dashboard/analytics">>) {
  const user = await verifySession()

  if (!user) {
    redirect("/login")
  }

  if (user.plan !== "PREMIUM") {
    redirect("/dashboard#upgrade")
  }

  const query = await searchParams
  const range = parseAnalyticsRange(query.range)
  const period = parseAnalyticsPeriod(query.period)

  const [summary, weekly, trend, averages, distribution, stats] =
    await Promise.all([
      getAnalyticsForSession(),
      getWeeklySummaryForSession(),
      getTrendForSession(range),
      getPeriodAveragesForSession(period),
      getCategoryDistributionForSession(),
      getCategoryStatsForSession()
    ])

  // La sesión ya se validó como Premium; si la API rechazó igualmente (sesión
  // caducada entre el guard y los datos), se degrada al banner de upgrade.
  if (!summary) {
    redirect("/dashboard#upgrade")
  }

  const rangeLabel = range === "7d" ? "7" : "30"

  return (
    <>
      <MedicalDisclaimer />

      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-white lg:text-3xl">
          Análisis
        </h1>
        <p className="mt-1 text-xs text-slate-400">
          Métricas, tendencias y patrones de tu presión arterial, calculados por
          Tensi.
        </p>
      </div>

      <AnalyticsSummaryCards summary={summary} />

      {weekly ? (
        <section
          aria-label="Resumen de los últimos 7 días"
          className="grid grid-cols-1 gap-4 sm:grid-cols-3"
        >
          <AnalyticsWeeklyKpis summary={weekly} />
        </section>
      ) : null}

      <ReadingsTrendChart
        readings={trend ?? []}
        title="Tendencia"
        subtitle={`Sistólica y diastólica · últimos ${rangeLabel} días`}
        actions={<AnalyticsRangeToggle range={range} period={period} />}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <AnalyticsPeriodAverages
          period={period}
          averages={averages ?? []}
          actions={<AnalyticsPeriodToggle period={period} range={range} />}
        />
        <AnalyticsCategoryDistribution
          distribution={summary.categoryDistribution}
        />
      </div>

      <AnalyticsCategoryEvolution points={distribution ?? []} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <AnalyticsCategoryStatsTable stats={stats ?? []} />
        <AnalyticsEmergencyAlerts
          count={summary.emergencyAlertsCount}
          alerts={summary.emergencyAlerts}
        />
      </div>
    </>
  )
}
