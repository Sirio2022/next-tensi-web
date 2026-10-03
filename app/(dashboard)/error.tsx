"use client"

// Los error boundaries deben ser Client Components.
import { Card } from "@/components/ui/card"
import { TriangleAlert } from "lucide-react"
import Link from "next/link"
import { useEffect } from "react"

interface DashboardErrorProps {
  error: Error & { digest?: string }
  retry: () => void
}

/**
 * Frontera de error del área autenticada. Se renderiza dentro del `<main>` del
 * shell (sidebar y header siguen visibles), por eso no repite el fondo de
 * pantalla completa. Captura, entre otros, un 5xx de `check-token`.
 */
export default function DashboardError({
  error,
  retry
}: Readonly<DashboardErrorProps>) {
  useEffect(() => {
    // Punto de enganche para reportar el error a un servicio externo.
    console.error(error)
  }, [error])

  return (
    <Card className="relative overflow-hidden p-8 text-center">
      <div
        className="pointer-events-none absolute -top-24 -right-24 size-64 rounded-full bg-tensi-rose/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-md space-y-4">
        <div className="mx-auto flex size-16 items-center justify-center rounded-2xl border border-tensi-rose/20 bg-tensi-rose/10 text-tensi-rose">
          <TriangleAlert className="size-8" />
        </div>

        <h2 className="text-xl font-bold tracking-tight text-white">
          No pudimos cargar tu panel
        </h2>
        <p className="text-xs/relaxed text-slate-400">
          Ocurrió un error inesperado al recuperar tu información. Verifica tu
          conexión e inténtalo de nuevo.
        </p>
        {error.digest ? (
          <p className="text-[10px] text-slate-500">
            Referencia: {error.digest}
          </p>
        ) : null}

        <div className="flex flex-col justify-center gap-3 pt-2 sm:flex-row">
          <button
            type="button"
            onClick={() => retry()}
            className="inline-flex items-center justify-center rounded-xl bg-linear-to-r from-tensi-600 to-tensi-violet px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-tensi-600/20 transition-all hover:scale-[1.02] active:scale-95 focus-visible:ring-2 focus-visible:ring-tensi-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 focus-visible:outline-none"
          >
            Reintentar
          </button>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-xl border border-slate-700/80 bg-slate-900/90 px-5 py-3 text-sm font-semibold text-slate-200 transition-all hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-tensi-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 focus-visible:outline-none"
          >
            Volver al panel
          </Link>
        </div>
      </div>
    </Card>
  )
}
