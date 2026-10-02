/**
 * Footer compartido por la landing y las pantallas de auth (unifica el footer
 * de la SPEC 01 con el de `references/01-landing`). Server Component.
 */
export function SiteFooter() {
  return (
    <footer
      id="contacto"
      className="relative z-10 w-full border-t border-slate-800/80 bg-slate-950 py-12 text-xs text-slate-400"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2.5 mb-3">
              <span className="size-8 rounded-lg bg-linear-to-tr from-tensi-400 to-tensi-violet flex items-center justify-center text-white">
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
                    strokeWidth={2.5}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </span>
              <span className="font-extrabold text-base text-white">Tensi</span>
            </div>
            <p className="text-slate-400 text-xs/relaxed max-w-sm">
              Controla tu presión arterial de forma inteligente y mejora tu salud cardiovascular.
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-white text-xs uppercase tracking-wider mb-3">
              Enlaces
            </h2>
            <ul className="space-y-2">
              <li>
                <a href="#" className="hover:text-tensi-400 transition-colors">
                  Términos y Condiciones
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-tensi-400 transition-colors">
                  Política de Privacidad
                </a>
              </li>
              <li>
                <a href="#contacto" className="hover:text-tensi-400 transition-colors">
                  Contacto
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="font-semibold text-white text-xs uppercase tracking-wider mb-3">
              Desarrollado por
            </h2>
            <ul className="space-y-1.5 text-slate-400">
              <li className="font-medium text-slate-200">Juan Manuel Alvarez</li>
              <li className="flex items-center space-x-1">
                <svg className="size-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Medellín, Colombia</span>
              </li>
              <li className="flex items-center space-x-1 pt-1">
                <svg className="size-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <a href="mailto:juanmadev@icloud.com" className="text-tensi-400 hover:underline">
                  juanmadev@icloud.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800/60 text-center sm:text-left">
          <p className="text-slate-500 text-[11px]">© 2026 Tensi. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
