"use client"

import { useSiteHeader } from "@/lib/site/hooks/use-site-header"
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
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center space-x-3 group"
            onClick={closeMenu}
          >
            <span className="size-10 rounded-xl bg-linear-to-tr from-tensi-500 via-indigo-500 to-tensi-violet flex items-center justify-center shadow-lg shadow-tensi-500/20 group-hover:scale-105 transition-transform duration-300">
              <svg
                className="size-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </span>
            <span className="font-extrabold text-xl tracking-tight text-white group-hover:text-tensi-400 transition-colors">
              Tensi
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-300">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="hover:text-tensi-400 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={handleLogin}
              className="hidden sm:inline-flex text-sm font-medium text-slate-300 hover:text-white px-3.5 py-2 rounded-xl transition-colors"
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={handleRegister}
              className="bg-linear-to-r from-tensi-500 to-blue-600 hover:from-tensi-400 hover:to-blue-500 text-white font-semibold text-xs sm:text-sm px-4 sm:px-5 py-2 rounded-full shadow-lg shadow-tensi-500/20 transition-all hover:scale-[1.02] flex items-center space-x-2"
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
              className="md:hidden p-2 rounded-lg text-slate-300 hover:text-white transition-colors"
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
            className="md:hidden border-t border-slate-800/80 py-3 space-y-1 text-sm font-medium text-slate-300"
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMenu}
                className="block px-3 py-2 rounded-lg hover:bg-slate-900 hover:text-tensi-400 transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <button
              type="button"
              onClick={handleLogin}
              className="block w-full text-left px-3 py-2 rounded-lg hover:bg-slate-900 hover:text-tensi-400 transition-colors sm:hidden"
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={handleRegister}
              className="block w-full text-left px-3 py-2 rounded-lg hover:bg-slate-900 hover:text-tensi-400 transition-colors"
            >
              Comenzar Gratis
            </button>
          </nav>
        ) : null}
      </div>
    </header>
  )
}
