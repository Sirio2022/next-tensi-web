import { BrandLogo } from "@/components/ui/brand-logo"
import { Sun } from "lucide-react"
import Link from "next/link"

/** Header compartido de las pantallas de auth (logo + toggle de tema del mockup). */
export function AuthHeader() {
  return (
    <header className="relative z-10 w-full border-b border-line bg-surface/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <BrandLogo className="size-9" priority />
          <span className="text-xl font-bold tracking-tight bg-linear-to-r from-fg via-fg to-fg-muted bg-clip-text text-transparent">
            Tensi
          </span>
        </Link>

        <button
          type="button"
          disabled
          aria-disabled="true"
          title="Próximamente"
          className="p-2 rounded-lg bg-card border border-line-strong text-fg-muted enabled:hover:text-fg transition-colors disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Sun className="size-5" />
          <span className="sr-only">Cambiar tema (Próximamente)</span>
        </button>
      </div>
    </header>
  )
}
