"use client"

import { useCallback, useEffect, useState } from "react"

const TOAST_DURATION_MS = 3000

/**
 * Auto-descarte de un toast individual. El timer se pausa con `hover`/`focus`
 * y se cancela al desmontar (WCAG 2.2.1, Timing Adjustable).
 */
export function useToastItem(id: number, onDismiss: (id: number) => void) {
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused) return

    const timer = window.setTimeout(() => onDismiss(id), TOAST_DURATION_MS)
    return () => window.clearTimeout(timer)
  }, [id, onDismiss, paused])

  const pause = useCallback(() => setPaused(true), [])
  const resume = useCallback(() => setPaused(false), [])

  return { pause, resume }
}
