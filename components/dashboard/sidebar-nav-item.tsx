import { LockBadge } from "@/components/ui/lock-badge"
import {
  preventPlaceholderNavigation,
  type DashboardNavItem,
  type DashboardNavItemId,
  type DashboardNavItemState
} from "@/lib/dashboard/nav"
import {
  ChartColumn,
  FileText,
  LayoutDashboard,
  Plus,
  RotateCcwClock,
  Settings
} from "lucide-react"
import Link from "next/link"
import type { ReactNode } from "react"

/** Íconos del sidebar por ítem; heredan el color del texto salvo el de Nueva Lectura. */
const NAV_ICON: Record<DashboardNavItemId, ReactNode> = {
  dashboard: <LayoutDashboard className="size-5" />,
  "new-reading": <Plus className="size-5 text-emerald-400" />,
  history: <RotateCcwClock className="size-5" />,
  analytics: <ChartColumn className="size-5" />,
  reports: <FileText className="size-5" />,
  settings: <Settings className="size-5" />
}

interface SidebarNavItemBaseProps {
  item: DashboardNavItem
  /** Marca el ítem como la página actual (`aria-current="page"`). */
  active?: boolean
}

/**
 * Props del ítem del sidebar como unión discriminada sobre `state`: cuando el
 * ítem está `locked`, `onLockedSelect` es obligatorio; el tipo impide
 * renderizarlo sin handler.
 */
type SidebarNavItemProps = SidebarNavItemBaseProps &
  (
    | { state: "locked"; onLockedSelect: () => void }
    | {
        state: Exclude<DashboardNavItemState, "locked">
        onLockedSelect?: never
      }
  )

/**
 * Ítem del sidebar. `locked` se renderiza como botón que lleva al banner de
 * upgrade; `placeholder` no navega (aún no implementado) y `link` navega.
 */
export function SidebarNavItem({
  item,
  active = false,
  state,
  onLockedSelect
}: Readonly<SidebarNavItemProps>) {
  const icon = NAV_ICON[item.id]

  if (state === "locked") {
    return (
      <button
        type="button"
        onClick={onLockedSelect}
        className="flex w-full items-center justify-between gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-400 transition-all hover:bg-slate-900/60 hover:text-slate-100 focus-visible:ring-2 focus-visible:ring-tensi-400/70 focus-visible:outline-none"
      >
        <span className="flex items-center gap-3">
          {icon}
          {item.label}
        </span>
        <LockBadge />
      </button>
    )
  }

  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      onClick={state === "placeholder" ? preventPlaceholderNavigation : undefined}
      className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm transition-all focus-visible:ring-2 focus-visible:ring-tensi-400/70 focus-visible:outline-none ${
        active
          ? "border border-tensi-500/20 bg-tensi-600/10 font-semibold text-tensi-400"
          : "font-medium text-slate-400 hover:bg-slate-900/60 hover:text-slate-100"
      }`}
    >
      {icon}
      {item.label}
    </Link>
  )
}
