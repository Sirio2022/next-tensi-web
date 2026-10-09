"use client"

import { useId, useRef, useState, type KeyboardEvent } from "react"

export type ProfileTabId = "profile" | "password"

export interface ProfileTab {
  id: ProfileTabId
  label: string
  /** La pestaña de contraseña se bloquea en cuentas sin contraseña local. */
  disabled: boolean
}

export interface ProfileTabsState {
  tabs: readonly ProfileTab[]
  activeTab: ProfileTabId
  selectTab: (id: ProfileTabId) => void
  handleKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void
  registerTab: (id: ProfileTabId) => (element: HTMLButtonElement | null) => void
  tabId: (id: ProfileTabId) => string
  panelId: (id: ProfileTabId) => string
}

/**
 * Estado de las pestañas de Perfil / Cambiar Contraseña siguiendo el patrón
 * ARIA de tabs: pestaña activa local, ids estables para `tab`/`tabpanel` y
 * navegación con flechas/Home/End sobre las pestañas habilitadas. La pestaña de
 * contraseña se deshabilita cuando la cuenta no tiene contraseña local
 * (`hasPassword === false`, caso OAuth).
 *
 * `initialTab` permite abrir directamente una pestaña (SPEC 18: `?tab=password`
 * desde "Acceso Rápido"). Si apunta a contraseña en una cuenta sin contraseña
 * local, se ignora y se abre "Perfil".
 */
export function useProfileTabs(
  hasPassword: boolean,
  initialTab: ProfileTabId = "profile"
): ProfileTabsState {
  const [activeTab, setActiveTab] = useState<ProfileTabId>(
    initialTab === "password" && !hasPassword ? "profile" : initialTab
  )
  const baseId = useId()
  const tabRefs = useRef<Record<ProfileTabId, HTMLButtonElement | null>>({
    profile: null,
    password: null
  })

  const tabs: readonly ProfileTab[] = [
    { id: "profile", label: "Perfil", disabled: false },
    { id: "password", label: "Cambiar Contraseña", disabled: !hasPassword }
  ]

  const enabledTabs = tabs.filter((tab) => !tab.disabled)

  const tabId = (id: ProfileTabId) => `${baseId}-tab-${id}`
  const panelId = (id: ProfileTabId) => `${baseId}-panel-${id}`

  const selectTab = (id: ProfileTabId) => {
    setActiveTab(id)
  }

  const registerTab =
    (id: ProfileTabId) => (element: HTMLButtonElement | null) => {
      tabRefs.current[id] = element
    }

  const focusTab = (id: ProfileTabId) => {
    tabRefs.current[id]?.focus()
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const currentIndex = enabledTabs.findIndex((tab) => tab.id === activeTab)
    if (currentIndex === -1) return

    let nextIndex: number | undefined

    switch (event.key) {
      case "ArrowRight":
        nextIndex = (currentIndex + 1) % enabledTabs.length
        break
      case "ArrowLeft":
        nextIndex = (currentIndex - 1 + enabledTabs.length) % enabledTabs.length
        break
      case "Home":
        nextIndex = 0
        break
      case "End":
        nextIndex = enabledTabs.length - 1
        break
      default:
        return
    }

    event.preventDefault()
    const nextTab = enabledTabs[nextIndex]
    if (!nextTab) return

    setActiveTab(nextTab.id)
    focusTab(nextTab.id)
  }

  return {
    tabs,
    activeTab,
    selectTab,
    handleKeyDown,
    registerTab,
    tabId,
    panelId
  }
}
