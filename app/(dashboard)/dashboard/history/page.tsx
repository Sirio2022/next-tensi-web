import { HistoryPagination } from "@/components/dashboard/history-pagination"
import { ReadingsHistoryList } from "@/components/dashboard/readings-history-list"
import { verifySession } from "@/lib/auth/dal"
import { getReadingsForSession } from "@/lib/readings/dal"
import {
  buildReadingsPageHref,
  parseReadingsPage,
  READINGS_PAGE_SIZE
} from "@/lib/readings/pagination"
import type { Metadata } from "next"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "Historial"
}

/**
 * Pantalla de Historial (Server Component). Lee `?page` y pide a la API la
 * página correspondiente (`getReadingsForSession(skip, 20)`, memoizado). Los
 * usuarios Premium ven los controles de paginación; el plan Free sigue capado a
 * 20 lecturas por el back, con la tarjeta de límite y sin controles.
 */
export default async function HistoryPage({
  searchParams
}: Readonly<PageProps<"/dashboard/history">>) {
  const user = await verifySession()

  if (!user) {
    redirect("/login")
  }

  const query = await searchParams
  const page = parseReadingsPage(query.page)
  const skip = (page - 1) * READINGS_PAGE_SIZE

  const response = await getReadingsForSession(skip, READINGS_PAGE_SIZE)

  if (!response) {
    redirect("/login")
  }

  const { data, meta } = response
  const totalPages = Math.max(1, Math.ceil(meta.total / READINGS_PAGE_SIZE))

  // Página fuera de rango: vuelve a la última válida (solo Premium pagina).
  if (!meta.isFreePlan && meta.total > 0 && page > totalPages) {
    redirect(buildReadingsPageHref(totalPages))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-white lg:text-3xl">
          Historial
        </h1>
        <p className="mt-1 text-xs text-slate-400">
          Tus mediciones registradas, de la más reciente a la más antigua.
        </p>
      </div>

      <ReadingsHistoryList readings={data} meta={meta} />

      {meta.isFreePlan === false ? (
        <HistoryPagination page={page} total={meta.total} />
      ) : null}
    </div>
  )
}
