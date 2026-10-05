import type { Route } from "next"

/** Lecturas por página del Historial Premium. */
export const READINGS_PAGE_SIZE = 20

/**
 * `?page=` → entero >= 1. Cualquier valor ausente, no numérico, no entero o
 * menor que 1 cae a la página 1.
 */
export function parseReadingsPage(
  value: string | string[] | undefined
): number {
  const raw = Array.isArray(value) ? value[0] : value
  const parsed = Number(raw)

  if (!Number.isInteger(parsed) || parsed < 1) return 1

  return parsed
}

/** Enlace de la página `page` del Historial; la primera no lleva `?page=`. */
export function buildReadingsPageHref(page: number): Route {
  if (!Number.isInteger(page) || page < 2) return "/dashboard/history"

  return `/dashboard/history?page=${page}` as Route
}
