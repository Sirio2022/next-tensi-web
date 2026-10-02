import Link from "next/link"

/** Header compartido de las pantallas de auth (logo + toggle de tema del mockup). */
export function AuthHeader() {
  return (
    <header className="relative z-10 w-full border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <span className="size-9 rounded-xl bg-linear-to-br from-tensi-400 to-tensi-600 p-0.5 shadow-lg shadow-tensi-500/20 group-hover:scale-105 transition-transform duration-300">
            <span className="size-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <svg
                className="size-5 text-tensi-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </span>
          </span>
          <span className="text-xl font-bold tracking-tight bg-linear-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Tensi
          </span>
        </Link>

        <button
          type="button"
          disabled
          aria-disabled="true"
          title="Próximamente"
          className="p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-400 enabled:hover:text-white transition-colors disabled:cursor-not-allowed disabled:opacity-60"
        >
          <svg
            className="size-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
          <span className="sr-only">Cambiar tema (Próximamente)</span>
        </button>
      </div>
    </header>
  )
}
