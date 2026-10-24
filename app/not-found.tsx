import Link from "next/link"

/**
 * 404 de la app. El `not-found` por defecto de Next sigue `prefers-color-scheme`
 * y rompe el tema oscuro de Tensi; este replica el fondo con glows y los tokens
 * `tensi` del resto de la app.
 */
export default function NotFound() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-surface px-6 py-16 text-fg antialiased">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -top-40 left-1/2 h-125 w-200 -translate-x-1/2 bg-[radial-gradient(circle_at_50%_20%,rgba(56,189,248,0.15)_0%,rgba(139,92,246,0.12)_35%,transparent_70%)]" />
        <div className="absolute -right-24 -bottom-32 size-96 rounded-full bg-tensi-500/10 blur-[140px]" />
      </div>

      <div className="relative z-10 flex w-full max-w-lg flex-col items-center text-center">
        <p className="bg-linear-to-r from-tensi-400 via-tensi-violet to-tensi-violet bg-clip-text text-7xl font-extrabold tracking-tight text-transparent sm:text-8xl">
          404
        </p>
        <h1 className="mt-6 text-2xl font-bold text-fg sm:text-3xl">
          Página no encontrada
        </h1>
        <p className="mt-3 text-sm text-fg-muted sm:text-base">
          La página que buscas no existe o fue movida. Revisa la dirección o
          vuelve al inicio para seguir cuidando tu presión arterial.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full bg-linear-to-r from-accent to-accent-hover px-8 py-3.5 text-sm font-semibold text-accent-fg shadow-lg shadow-accent/25 transition-all duration-300 hover:scale-105 hover:from-accent-hover hover:to-accent focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface focus-visible:outline-none"
          >
            Volver al inicio
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-full border border-line-strong bg-card/90 px-8 py-3.5 text-sm font-semibold text-fg backdrop-blur-md transition-all duration-300 hover:bg-card-muted focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface focus-visible:outline-none"
          >
            Iniciar sesión
          </Link>
        </div>
      </div>
    </main>
  )
}
