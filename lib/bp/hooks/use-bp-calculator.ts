"use client"

import {
  categorize,
  categoryToBucket,
  type BpCategory,
  type BpVisualBucket
} from "@/lib/bp/bp-categories"
import { useMemo, useState } from "react"

export interface BpCalculatorResult {
  category: BpCategory
  bucket: BpVisualBucket
}

// Valores iniciales del mockup de la landing (`references/01-landing`).
const DEFAULT_SYSTOLIC = "120"
const DEFAULT_DIASTOLIC = "80"
const DEFAULT_PULSE = "72"

function parseReading(value: string): number | null {
  const trimmed = value.trim()
  if (trimmed === "") return null
  const parsed = Number(trimmed)
  return Number.isFinite(parsed) ? parsed : null
}

/**
 * Estado y lógica de la calculadora de presión de la landing. Mantiene los
 * inputs como strings controlados y deriva categoría + bucket a partir de
 * `categorize()`. Si falta alguno de los dos valores, `result` es `null`
 * (estado vacío) y el componente muestra un aviso neutro.
 */
export function useBpCalculator() {
  const [systolic, setSystolic] = useState(DEFAULT_SYSTOLIC)
  const [diastolic, setDiastolic] = useState(DEFAULT_DIASTOLIC)
  const [pulse, setPulse] = useState(DEFAULT_PULSE)

  const systolicValue = parseReading(systolic)
  const diastolicValue = parseReading(diastolic)

  const result = useMemo<BpCalculatorResult | null>(() => {
    if (systolicValue === null || diastolicValue === null) return null
    const category = categorize(systolicValue, diastolicValue)
    return { category, bucket: categoryToBucket(category) }
  }, [systolicValue, diastolicValue])

  return {
    values: { systolic, diastolic, pulse },
    setSystolic,
    setDiastolic,
    setPulse,
    result,
    /** `true` mientras no hay valores suficientes para clasificar. */
    isEmpty: result === null
  }
}
