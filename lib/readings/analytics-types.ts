/**
 * Contrato de datos de las analíticas Premium. Es el espejo en TypeScript de lo
 * que devuelve la API Nest (`bp-analytics-export.service.ts`,
 * `bp-readings-analytics.service.ts` y `weekly-summary.dto.ts`). El front nunca
 * calcula agregados de salud: solo formatea y muestra lo que el back entrega.
 */

import type { BloodPressureCategory } from "./types"

export interface EmergencyReadingAlert {
  id: string
  systolic: number
  diastolic: number
  timestamp: string
  notes: string | null
}

/** `GET /bp-readings/analytics` */
export interface AnalyticsSummary {
  totalReadings: number
  averages: { systolic: number; diastolic: number; pulse: number | null }
  categoryDistribution: Partial<Record<BloodPressureCategory, number>>
  emergencyAlertsCount: number
  emergencyAlerts: EmergencyReadingAlert[]
}

/** `GET /bp-readings/analytics/trend` */
export interface TrendReading {
  systolic: number
  diastolic: number
  timestamp: string
}

/** `GET /bp-readings/analytics/weekly|monthly|yearly` */
export interface WeeklyAverage {
  year: number
  week: number
  avgSystolic: number
  avgDiastolic: number
}

export interface MonthlyAverage {
  year: number
  month: number
  avgSystolic: number
  avgDiastolic: number
}

export interface YearlyAverage {
  year: number
  avgSystolic: number
  avgDiastolic: number
}

/** Mapa de granularidad → forma que devuelve cada endpoint de promedios. */
export interface PeriodAveragesMap {
  weekly: WeeklyAverage
  monthly: MonthlyAverage
  yearly: YearlyAverage
}

/** Punto de promedio tras uniformar weekly/monthly/yearly. */
export type PeriodAverage = WeeklyAverage | MonthlyAverage | YearlyAverage

/** `GET /bp-readings/analytics/stats` */
export interface CategoryStat {
  category: BloodPressureCategory
  count: number
  avgSystolic: number
  avgDiastolic: number
  lastReading: string
}

/** `GET /bp-readings/analytics/category-distribution` */
export interface CategoryDistributionPoint {
  year: number
  month: number
  category: BloodPressureCategory
  count: number
}

/** `GET /bp-readings/analytics/weekly-summary` (endpoint nuevo) */
export interface WeeklySummaryPoint {
  systolic: number
  diastolic: number
  timestamp: string
}

export interface WeeklySummary {
  peak: WeeklySummaryPoint | null
  lowest: WeeklySummaryPoint | null
  average: { systolic: number; diastolic: number } | null
  /** % redondeado de la sistólica vs los 7 días previos; null sin base. */
  changePercent: number | null
}

export type AnalyticsRange = "7d" | "30d"
export type AnalyticsPeriod = "weekly" | "monthly" | "yearly"
