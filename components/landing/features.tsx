/** Sección de features de la landing. `#tendencias` apunta a la tarjeta "Analiza". */
export function Features() {
  return (
    <section
      id="caracteristicas"
      className="scroll-mt-20 py-16 bg-slate-900/30 border-t border-slate-800/80"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 backdrop-blur-xl p-8 flex flex-col justify-between shadow-[0_0_30px_-10px_rgba(59,130,246,0.25)] hover:-translate-y-1 transition-transform duration-300">
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-6">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Registra tus mediciones</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Lleva un control preciso de tu presión arterial diariamente de forma intuitiva y
                rápida.
              </p>
            </div>
          </div>

          <div
            id="tendencias"
            className="scroll-mt-20 rounded-2xl border border-slate-800 bg-slate-900/70 backdrop-blur-xl p-8 flex flex-col justify-between shadow-[0_0_30px_-10px_rgba(16,185,129,0.25)] hover:-translate-y-1 transition-transform duration-300"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-6">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M23 6l-9.5 9.5-5-5L1 18" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 6h6v6" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Analiza tendencias</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Visualiza patrones detallados y evalúa la evolución continua de tu salud
                cardiovascular.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 backdrop-blur-xl p-8 flex flex-col justify-between shadow-[0_0_30px_-10px_rgba(244,63,94,0.25)] hover:-translate-y-1 transition-transform duration-300">
            <div>
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-6">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 6l-4-4-4 4" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2v13" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Comparte con tu médico</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Genera reportes profesionales y consolidados listos para llevar a tus consultas
                médicas.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
