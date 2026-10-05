import { BrandLogo } from "@/components/ui/brand-logo"
import Link from "next/link"

/** Marca Tensi del sidebar: logo de la app + wordmark. */
export function SidebarBrand() {
  return (
    <Link
      href="/dashboard"
      className="group flex items-center gap-3 rounded-xl focus-visible:ring-2 focus-visible:ring-tensi-400/70 focus-visible:outline-none"
    >
      <BrandLogo className="size-9 transition-transform group-hover:scale-105" />
      <span className="bg-linear-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-xl font-bold tracking-tight text-transparent">
        Tensi
      </span>
    </Link>
  )
}
