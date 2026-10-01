/** Footer compartido de las pantallas de auth, según los mockups. */
export function AuthFooter() {
  return (
    <footer className="relative z-10 w-full border-t border-slate-800/60 bg-slate-950/80 backdrop-blur-xl py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h2 className="text-sm font-semibold text-white mb-2">Tensi</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Controla tu presión arterial de forma inteligente y mejora tu salud cardiovascular.
          </p>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-white mb-2">Enlaces</h2>
          <ul className="space-y-1.5 text-xs text-slate-400">
            <li>
              <a href="#" className="hover:text-slate-200 transition-colors">
                Términos y Condiciones
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-slate-200 transition-colors">
                Política de Privacidad
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-slate-200 transition-colors">
                Contacto
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-white mb-2">Desarrollado por</h2>
          <p className="text-xs text-slate-400">Juan Manuel Alvarez</p>
          <p className="text-xs text-slate-400">Medellín, Colombia</p>
          <a
            href="mailto:juanmadev@icloud.com"
            className="text-xs text-tensi-400 hover:text-tensi-300 transition-colors"
          >
            juanmadev@icloud.com
          </a>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 pt-6 border-t border-slate-800/40 text-center">
        <p className="text-[11px] text-slate-400">© 2026 Tensi. Todos los derechos reservados.</p>
      </div>
    </footer>
  )
}
