/** Claves estables para las celdas del skeleton de la tabla de rangos. */
const RANGE_SKELETON_ITEMS = [0, 1, 2, 3, 4, 5]

/**
 * Fallback de carga del dashboard. Replica la silueta del contenido (aviso,
 * cabecera con CTA, tarjetas y referencia de rangos) para que el shell pinte de
 * inmediato mientras la página resuelve `verifySession()`. `loading.tsx` se
 * monta dentro del `<main>` del shell, así que no repite sidebar ni header.
 */
export default function DashboardLoading() {
  return (
    <div className="space-y-8" aria-busy="true">
      <span className="sr-only">Cargando el panel principal…</span>

      <div className="h-14 w-full animate-pulse rounded-2xl bg-slate-900/60" />

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="space-y-2">
          <div className="h-8 w-40 animate-pulse rounded-lg bg-slate-900/60" />
          <div className="h-4 w-64 max-w-full animate-pulse rounded-md bg-slate-900/60" />
        </div>
        <div className="h-11 w-full animate-pulse rounded-xl bg-slate-900/60 sm:w-52" />
      </div>

      <div className="h-64 w-full animate-pulse rounded-3xl bg-slate-900/60" />

      <div className="h-44 w-full animate-pulse rounded-3xl bg-slate-900/60" />

      <div className="space-y-4 rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6">
        <div className="h-4 w-72 max-w-full animate-pulse rounded-md bg-slate-800/60" />
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">
          {RANGE_SKELETON_ITEMS.map((key) => (
            <div
              key={key}
              className="h-14 animate-pulse rounded-xl bg-slate-800/60"
            />
          ))}
        </div>
      </div>
    </div>
  )
}
