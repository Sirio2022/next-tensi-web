import { BrandLogo } from "@/components/ui/brand-logo"
import { Sun } from "lucide-react"
import Link from "next/link"

/** Header compartido de las pantallas de auth (logo + toggle de tema del mockup). */
export function AuthHeader() {
  return (
    <header className="relative z-10 w-full border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <BrandLogo className="size-9" priority />
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
          <Sun className="size-5" />
          <span className="sr-only">Cambiar tema (Próximamente)</span>
        </button>
      </div>
    </header>
  )
}
