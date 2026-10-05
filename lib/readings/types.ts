/**
 * Contrato de datos de las mediciones de presión arterial. Es el espejo en
 * TypeScript de lo que ya devuelve la API Nest (`bp-readings.service.ts`,
 * `ai-insight.dto.ts` y `bp-emergency-evaluator.util.ts`). El front nunca
 * calcula salud: solo formatea y muestra lo que el back entrega.
 */

export type BloodPressureCategory =
  | "severe_hypotension"
  | "moderate_hypotension"
  | "mild_hypotension"
  | "optimal"
  | "normal"
  | "high_normal"
  | "grade_1_hypertension"
  | "grade_2_hypertension"
  | "grade_3_hypertension"

export type EmergencySeverity =
  | "NORMAL"
  | "WARNING"
  | "CRISIS_HYPERTENSIVE"
  | "CRISIS_HYPOTENSIVE"

export type EmergencyAction = "NONE" | "CONSULT_DOCTOR" | "SEEK_IMMEDIATE_CARE"

export interface EmergencyAssessment {
  isEmergency: boolean
  severity: EmergencySeverity
  category: BloodPressureCategory
  actionRequired: EmergencyAction
  uiMessage: {
    title: string
    body: string
    primaryButtonText: string
  }
}

export interface BPReading {
  id: string
  systolic: number
  diastolic: number
  pulse: number | null
  notes: string | null
  category: BloodPressureCategory
  tags: string[]
  arm: "RIGHT" | "LEFT"
  posture: "SITTING" | "STANDING" | "LYING_DOWN"
  irregularHeartBeat: boolean
  userId: string
  timestamp: string
  createdAt: string
  updatedAt: string
}

export interface AIInsight {
  insight: string
  confidence: number
  patterns?: string[]
  /** Solo viene cuando el back corta por cuota agotada. */
  usageCount?: number
  error?: string
}

export interface CreateReadingResponse {
  reading: BPReading
  emergencyAssessment: EmergencyAssessment
  analysis: AIInsight
}

/** `GET /api/bp-readings` (ramas Free y Premium del servicio). */
export interface ReadingsMeta {
  total: number
  visible: number
  hiddenReadings: number
  skip: number
  limit: number
  hasMore: boolean
  isFreePlan: boolean
  requiresUpgrade?: boolean
}

export interface ReadingsResponse {
  data: BPReading[]
  meta: ReadingsMeta
}

export interface CreateReadingInput {
  systolic: number
  diastolic: number
  pulse?: number
  notes?: string
  tags?: string[]
  timestamp?: string
}
