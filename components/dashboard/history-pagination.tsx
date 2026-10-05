import { buttonClasses } from "@/components/ui/button"
import { ButtonLink } from "@/components/ui/button-link"
import {
  buildReadingsPageHref,
  READINGS_PAGE_SIZE
} from "@/lib/readings/pagination"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface HistoryPaginationProps {
  page: number
  total: number
}

/**
 * Controles de paginación del Historial Premium (20 por página). Sin estado:
 * Anterior/Siguiente son enlaces con `?page=`; en los extremos se representan
 * como elementos deshabilitados (`aria-disabled`).
 */
export function HistoryPagination({
  page,
  total
}: Readonly<HistoryPaginationProps>) {
  const totalPages = Math.max(1, Math.ceil(total / READINGS_PAGE_SIZE))
  const hasPrevious = page > 1
  const hasNext = page < totalPages

  return (
    <nav
      aria-label="Paginación del historial"
      className="flex flex-wrap items-center justify-between gap-3"
    >
      {hasPrevious ? (
        <ButtonLink
          href={buildReadingsPageHref(page - 1)}
          tone="primary"
          size="sm"
          rel="prev"
        >
          <ChevronLeft className="size-4" aria-hidden />
          Anterior
        </ButtonLink>
      ) : (
        <span
          aria-disabled="true"
          className={`${buttonClasses({ tone: "primary", size: "sm" })} pointer-events-none opacity-50`}
        >
          <ChevronLeft className="size-4" aria-hidden />
          Anterior
        </span>
      )}

      <p aria-live="polite" className="text-xs text-slate-400">
        Página <span className="font-semibold text-slate-200">{page}</span> de{" "}
        {totalPages}
      </p>

      {hasNext ? (
        <ButtonLink
          href={buildReadingsPageHref(page + 1)}
          tone="primary"
          size="sm"
          rel="next"
        >
          Siguiente
          <ChevronRight className="size-4" aria-hidden />
        </ButtonLink>
      ) : (
        <span
          aria-disabled="true"
          className={`${buttonClasses({ tone: "primary", size: "sm" })} pointer-events-none opacity-50`}
        >
          Siguiente
          <ChevronRight className="size-4" aria-hidden />
        </span>
      )}
    </nav>
  )
}
