"use client"

import { useSiteHeader } from "@/lib/site/hooks/use-site-header"
import { BrandLogo } from "@/components/ui/brand-logo"
import { ArrowRight, Menu, X } from "lucide-react"
import Link from "next/link"

const NAV_LINKS = [
  { href: "#caracteristicas", label: "Registra" },
  { href: "#tendencias", label: "Analiza" },
  { href: "#simulador", label: "Calculadora" },
  { href: "#contacto", label: "Contacto" }
] as const

/**
 * Header de la landing: logo, navegación por anclas (colapsable en móvil) y
 * botones que abren los modales de auth a través de `useAuthModals`.
 */
export function SiteHeader() {
  const { menuOpen, closeMenu, toggleMenu, handleLogin, handleRegister } =
    useSiteHeader()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-line bg-surface/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2.5 group"
            onClick={closeMenu}
          >
            <BrandLogo className="size-10" priority />

            <span className="font-extrabold text-xl tracking-tight text-fg group-hover:text-accent-text transition-colors">
              Tensi
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-fg-muted">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="hover:text-accent-text transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={handleLogin}
              className="hidden sm:inline-flex text-sm font-medium text-fg-muted hover:text-fg px-3.5 py-2 rounded-xl transition-colors"
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={handleRegister}
              className="bg-linear-to-r from-accent to-tensi-500 hover:from-accent-hover hover:to-tensi-400 text-accent-fg font-semibold text-xs sm:text-sm px-4 sm:px-5 py-2 rounded-full shadow-lg shadow-accent/20 transition-all hover:scale-[1.02] flex items-center space-x-2"
            >
              <span>Comenzar Gratis</span>
              <ArrowRight className="size-4" />
            </button>

            <button
              type="button"
              onClick={toggleMenu}
              aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              className="md:hidden p-2 rounded-lg text-fg-muted hover:text-fg transition-colors"
            >
              {menuOpen ? (
                <X className="size-6" />
              ) : (
                <Menu className="size-6" />
              )}
            </button>
          </div>
        </div>

        {menuOpen ? (
          <nav
            id="mobile-nav"
            className="md:hidden border-t border-line py-3 space-y-1 text-sm font-medium text-fg-muted"
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMenu}
                className="block px-3 py-2 rounded-lg hover:bg-card hover:text-accent-text transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <button
              type="button"
              onClick={handleLogin}
              className="block w-full text-left px-3 py-2 rounded-lg hover:bg-card hover:text-accent-text transition-colors sm:hidden"
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={handleRegister}
              className="block w-full text-left px-3 py-2 rounded-lg hover:bg-card hover:text-accent-text transition-colors"
            >
              Comenzar Gratis
            </button>
          </nav>
        ) : null}
      </div>
    </header>
  )
}
