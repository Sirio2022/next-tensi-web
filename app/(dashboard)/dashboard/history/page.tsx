import { ReadingsHistoryList } from "@/components/dashboard/readings-history-list"
import { verifySession } from "@/lib/auth/dal"
import { getReadingsForSession } from "@/lib/readings/dal"
import type { Metadata } from "next"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "Historial"
}

/**
 * Pantalla de Historial (plan Free). Server Component: lee las lecturas con
 * `getReadingsForSession()` (cookie reenviada, memoizado) y las pasa a la lista
 * de solo lectura. El back decide cuántas lecturas son visibles según el plan.
 */
export default async function HistoryPage() {
  const user = await verifySession()

  if (!user) {
    redirect("/login")
  }

  const response = await getReadingsForSession()

  if (!response) {
    redirect("/login")
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

      <ReadingsHistoryList readings={response.data} meta={response.meta} />
    </div>
  )
}
