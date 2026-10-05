"use client"

// Los error boundaries deben ser Client Components.
import { useErrorReport } from "@/lib/errors/hooks/use-error-report"
import Link from "next/link"

interface ErrorProps {
  error: Error & { digest?: string }
  retry: () => void
}

/**
 * Frontera de error del segmento raíz: captura los fallos de páginas y layouts
 * anidados que no tengan su propia `error.tsx`. Reutiliza el fondo con glows y
 * los tokens `tensi` del resto de la app.
 */
export default function Error({ error, retry }: Readonly<ErrorProps>) {
  useErrorReport(error)

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-6 py-16 text-slate-100 antialiased">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -top-40 left-1/2 h-125 w-200 -translate-x-1/2 bg-[radial-gradient(circle_at_50%_20%,rgba(56,189,248,0.15)_0%,rgba(139,92,246,0.12)_35%,transparent_70%)]" />
        <div className="absolute -right-24 -bottom-32 size-96 rounded-full bg-tensi-rose/10 blur-[140px]" />
      </div>

      <div className="relative z-10 flex w-full max-w-lg flex-col items-center text-center">
        <p className="bg-linear-to-r from-tensi-rose via-tensi-violet to-tensi-500 bg-clip-text text-7xl font-extrabold tracking-tight text-transparent sm:text-8xl">
          Error
        </p>
        <h1 className="mt-6 text-2xl font-bold text-white sm:text-3xl">
          Algo salió mal
        </h1>
        <p className="mt-3 text-sm text-slate-400 sm:text-base">
          Ocurrió un error inesperado y no pudimos cargar esta página. Puedes
          intentarlo de nuevo.
        </p>
        {error.digest ? (
          <p className="mt-2 text-xs text-slate-500">
            Referencia: {error.digest}
          </p>
        ) : null}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => retry()}
            className="inline-flex items-center justify-center rounded-full bg-linear-to-r from-tensi-500 to-blue-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-tensi-500/25 transition-all duration-300 hover:scale-105 hover:from-tensi-400 hover:to-blue-500 focus-visible:ring-2 focus-visible:ring-tensi-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 focus-visible:outline-none"
          >
            Reintentar
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-slate-700/80 bg-slate-900/90 px-8 py-3.5 text-sm font-semibold text-slate-200 backdrop-blur-md transition-all duration-300 hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-tensi-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 focus-visible:outline-none"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </main>
  )
}
