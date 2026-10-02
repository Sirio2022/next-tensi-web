import Link from "next/link"

/** Marca Tensi del sidebar: logo con gradiente `tensi` + wordmark. */
export function SidebarBrand() {
  return (
    <Link
      href="/dashboard"
      className="group flex items-center gap-3 rounded-xl focus-visible:ring-2 focus-visible:ring-tensi-400/70 focus-visible:outline-none"
    >
      <span className="size-9 rounded-xl bg-linear-to-br from-tensi-400 to-tensi-600 p-0.5 shadow-lg shadow-tensi-500/20 transition-transform group-hover:scale-105">
        <span className="flex size-full items-center justify-center rounded-[10px] bg-slate-950">
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
      <span className="bg-linear-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-xl font-bold tracking-tight text-transparent">
        Tensi
      </span>
    </Link>
  )
}
