import { createFetchClient } from "@/lib/http/fetch-client"
import { ApiError, type HttpClient } from "@/lib/http/types"
import { cookies } from "next/headers"
import { cache } from "react"
import "server-only"
import {
  getAnalytics,
  getAnalyticsTrend,
  getCategoryDistribution,
  getCategoryStats,
  getPeriodAverages,
  getWeeklySummary
} from "./analytics.api"
import type {
  AnalyticsPeriod,
  AnalyticsRange,
  AnalyticsSummary,
  CategoryDistributionPoint,
  CategoryStat,
  PeriodAverage,
  TrendReading,
  WeeklySummary
} from "./analytics-types"

/**
 * DAL server-only de las analíticas Premium. Cada función reenvía la cookie
 * entrante hacia la API y devuelve la respuesta, o `null` si la sesión no es
 * válida o el plan no es Premium (401/403).
 *
 * Se memoizan con `cache()` para ejecutarse una sola vez por render pass, aunque
 * lo llamen varios componentes; la página las combina con `Promise.all`.
 */

async function withSession<T>(
  run: (client: HttpClient) => Promise<T>
): Promise<T | null> {
  const cookieStore = await cookies()
  const cookie = cookieStore.toString()

  if (!cookie) return null

  // `fetch` de Next no propaga la cookie entrante por defecto: se reenvía
  // explícitamente el header `Cookie`.
  const sessionClient = createFetchClient(() => ({ Cookie: cookie }))

  try {
    return await run(sessionClient)
  } catch (error) {
    if (
      error instanceof ApiError &&
      (error.status === 401 || error.status === 403)
    ) {
      return null
    }
    throw error
  }
}

export const getAnalyticsForSession = cache(
  async (): Promise<AnalyticsSummary | null> =>
    withSession((client) => getAnalytics(client))
)

export const getTrendForSession = cache(
  async (range: AnalyticsRange): Promise<TrendReading[] | null> =>
    withSession((client) => getAnalyticsTrend(range, client))
)

export const getPeriodAveragesForSession = cache(
  async (period: AnalyticsPeriod): Promise<PeriodAverage[] | null> =>
    withSession((client) => getPeriodAverages(period, client))
)

export const getCategoryStatsForSession = cache(
  async (): Promise<CategoryStat[] | null> =>
    withSession((client) => getCategoryStats(client))
)

export const getCategoryDistributionForSession = cache(
  async (): Promise<CategoryDistributionPoint[] | null> =>
    withSession((client) => getCategoryDistribution(client))
)

export const getWeeklySummaryForSession = cache(
  async (): Promise<WeeklySummary | null> =>
    withSession((client) => getWeeklySummary(client))
)
