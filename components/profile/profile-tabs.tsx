"use client"

import type { AuthUser } from "@/lib/auth/types"
import { useProfileTabs } from "@/lib/profile/hooks/use-profile-tabs"
import { Lock, User } from "lucide-react"
import { PasswordForm } from "./password-form"
import { ProfileForm } from "./profile-form"

interface ProfileTabsProps {
  user: AuthUser
}

/**
 * Cabecera de pestañas (Perfil / Cambiar Contraseña) con el patrón ARIA de
 * tabs. La pestaña de contraseña queda deshabilitada con candado y una nota
 * cuando la cuenta no tiene contraseña local (`hasPassword === false`, OAuth).
 */
export function ProfileTabs({ user }: Readonly<ProfileTabsProps>) {
  const {
    tabs,
    activeTab,
    selectTab,
    handleKeyDown,
    registerTab,
    tabId,
    panelId
  } = useProfileTabs(user.hasPassword)

  return (
    <div className="space-y-8">
      <div
        role="tablist"
        aria-label="Secciones del perfil"
        className="flex items-center justify-center border-b border-slate-800"
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id

          return (
            <button
              key={tab.id}
              ref={registerTab(tab.id)}
              type="button"
              role="tab"
              id={tabId(tab.id)}
              aria-selected={isActive}
              aria-controls={panelId(tab.id)}
              tabIndex={isActive ? 0 : -1}
              disabled={tab.disabled}
              aria-disabled={tab.disabled}
              onClick={() => selectTab(tab.id)}
              onKeyDown={handleKeyDown}
              className={`flex items-center gap-2 border-b-2 px-6 py-3 text-sm font-medium transition focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none ${
                isActive
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              } ${tab.disabled ? "cursor-not-allowed text-slate-600 hover:text-slate-600" : ""}`}
            >
              {tab.id === "password" ? (
                <Lock className="size-4" aria-hidden />
              ) : (
                <User className="size-4" aria-hidden />
              )}
              {tab.label}
            </button>
          )
        })}
      </div>

      {!user.hasPassword ? (
        <p className="flex items-start gap-2 rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-400">
          <Lock className="mt-0.5 size-4 shrink-0 text-slate-500" aria-hidden />
          Tu cuenta se gestiona con Google/GitHub, así que el cambio de
          contraseña no está disponible: se administra desde tu proveedor.
        </p>
      ) : null}

      <div
        role="tabpanel"
        id={panelId(activeTab)}
        aria-labelledby={tabId(activeTab)}
        tabIndex={0}
        className="focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
      >
        {activeTab === "profile" ? (
          <ProfileForm user={user} />
        ) : (
          <PasswordForm />
        )}
      </div>
    </div>
  )
}
