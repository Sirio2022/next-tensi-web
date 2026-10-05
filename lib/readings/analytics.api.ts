import { http } from "@/lib/http/http"
import type { HttpClient } from "@/lib/http/types"
import { getRangeDates } from "./analytics"
import type {
  AnalyticsPeriod,
  AnalyticsRange,
  AnalyticsSummary,
  CategoryDistributionPoint,
  CategoryStat,
  PeriodAveragesMap,
  TrendReading,
  WeeklySummary
} from "./analytics-types"

/**
 * Llamadas a los endpoints de analíticas Premium de la API Nest. Reciben el
 * `HttpClient` por parámetro (por defecto el de navegador) para que la capa
 * server-side pueda pasar un cliente con la cookie entrante reenviada.
 */

function client(httpClient?: HttpClient): HttpClient {
  return httpClient ?? http
}

/** `GET /bp-readings/analytics` — resumen, promedios y emergencias. */
export function getAnalytics(httpClient?: HttpClient) {
  return client(httpClient).get<AnalyticsSummary>("/bp-readings/analytics")
}

/** `GET /bp-readings/analytics/trend` — serie cruda de la ventana pedida. */
export function getAnalyticsTrend(
  range: AnalyticsRange,
  httpClient?: HttpClient
) {
  const { startDate, endDate } = getRangeDates(range)
  const query = `?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`

  return client(httpClient).get<TrendReading[]>(
    `/bp-readings/analytics/trend${query}`
  )
}

/** `GET /bp-readings/analytics/{weekly|monthly|yearly}` — promedios. */
export function getPeriodAverages<P extends AnalyticsPeriod>(
  period: P,
  httpClient?: HttpClient
) {
  return client(httpClient).get<Array<PeriodAveragesMap[P]>>(
    `/bp-readings/analytics/${period}`
  )
}

/** `GET /bp-readings/analytics/stats` — conteo y promedio por categoría. */
export function getCategoryStats(httpClient?: HttpClient) {
  return client(httpClient).get<CategoryStat[]>("/bp-readings/analytics/stats")
}

/** `GET /bp-readings/analytics/category-distribution` — evolución mensual. */
export function getCategoryDistribution(httpClient?: HttpClient) {
  return client(httpClient).get<CategoryDistributionPoint[]>(
    "/bp-readings/analytics/category-distribution"
  )
}

/** `GET /bp-readings/analytics/weekly-summary` — pico, mínima y variación. */
export function getWeeklySummary(httpClient?: HttpClient) {
  return client(httpClient).get<WeeklySummary>(
    "/bp-readings/analytics/weekly-summary"
  )
}
