'use client'

import Link from 'next/link'
import type { MouseEvent, ReactNode } from 'react'
import { LockBadge } from '@/components/ui/lock-badge'
import type { DashboardNavItem, DashboardNavItemId } from '@/lib/dashboard/nav'

/** Íconos del sidebar por ítem; heredan el color del texto salvo el de Nueva Lectura. */
const NAV_ICON: Record<DashboardNavItemId, ReactNode> = {
  dashboard: (
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
        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
      />
    </svg>
  ),
  'new-reading': (
    <svg
      className="size-5 text-emerald-400"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
      />
    </svg>
  ),
  history: (
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
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  analytics: (
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
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
      />
    </svg>
  ),
  reports: (
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
        d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  ),
  settings: (
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
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  ),
}

interface SidebarNavItemProps {
  item: DashboardNavItem
  /** Marca el ítem como la página actual (`aria-current="page"`). */
  active?: boolean
  /** Se invoca al hacer click en un ítem bloqueado (Premium). */
  onLockedSelect?: () => void
}

/**
 * Ítem del sidebar. Los ítems bloqueados se renderizan como botón (su click
 * lleva al banner de upgrade); los no implementados (`href="#"`) no navegan.
 */
export function SidebarNavItem({
  item,
  active = false,
  onLockedSelect,
}: Readonly<SidebarNavItemProps>) {
  const icon = NAV_ICON[item.id]

  if (item.requiresPremium) {
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
      aria-current={active ? 'page' : undefined}
      onClick={item.href === '#' ? preventPlaceholderNavigation : undefined}
      className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm transition-all focus-visible:ring-2 focus-visible:ring-tensi-400/70 focus-visible:outline-none ${
        active
          ? 'border border-tensi-500/20 bg-tensi-600/10 font-semibold text-tensi-400'
          : 'font-medium text-slate-400 hover:bg-slate-900/60 hover:text-slate-100'
      }`}
    >
      {icon}
      {item.label}
    </Link>
  )
}

/** Los enlaces aún no implementados existen como marcador, pero no navegan. */
function preventPlaceholderNavigation(event: MouseEvent<HTMLAnchorElement>) {
  event.preventDefault()
}
