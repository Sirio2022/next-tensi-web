import { BrandLogo } from "@/components/ui/brand-logo"
import { Mail, MapPin } from "lucide-react"
import Link from "next/link"

/**
 * Footer compartido por la landing y las pantallas de auth (unifica el footer
 * de la SPEC 01 con el de `references/01-landing`). Server Component.
 */
export function SiteFooter() {
  return (
    <footer
      id="contacto"
      className="relative z-10 w-full border-t border-line bg-surface py-12 text-xs text-fg-muted"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2.5 mb-3">
              <BrandLogo className="size-8" />
              <span className="font-extrabold text-base text-fg">Tensi</span>
            </div>
            <p className="text-fg-muted text-xs/relaxed max-w-sm">
              Controla tu presión arterial de forma inteligente y mejora tu
              salud cardiovascular.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-fg text-xs uppercase tracking-wider mb-3">
              Enlaces
            </h3>
            <ul className="space-y-2">
              <li className="text-fg-muted">Términos y Condiciones</li>
              <li className="text-fg-muted">Política de Privacidad</li>
              <li>
                <Link
                  href="#contacto"
                  className="hover:text-accent-text transition-colors"
                >
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-fg text-xs uppercase tracking-wider mb-3">
              Desarrollado por
            </h3>
            <ul className="space-y-1.5 text-fg-muted">
              <li className="font-medium text-fg">
                Juan Manuel Alvarez
              </li>
              <li className="flex items-center space-x-1">
                <MapPin className="size-3 text-fg-subtle" />
                <span>Medellín, Colombia</span>
              </li>
              <li className="flex items-center space-x-1 pt-1">
                <Mail className="size-3 text-fg-subtle" />
                <Link
                  href="mailto:juanmadev@icloud.com"
                  className="text-accent-text hover:underline"
                >
                  juanmadev@icloud.com
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-line text-center sm:text-left">
          <p className="text-fg-muted text-[11px]">
            © 2026 Tensi. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
