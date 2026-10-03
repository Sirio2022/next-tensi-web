import { Activity, TrendingUp, Upload } from "lucide-react"

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
              <div className="size-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-6">
                <Activity className="size-6" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">
                Registra tus mediciones
              </h2>
              <p className="text-slate-400 text-sm/relaxed">
                Lleva un control preciso de tu presión arterial diariamente de
                forma intuitiva y rápida.
              </p>
            </div>
          </div>

          <div
            id="tendencias"
            className="scroll-mt-20 rounded-2xl border border-slate-800 bg-slate-900/70 backdrop-blur-xl p-8 flex flex-col justify-between shadow-[0_0_30px_-10px_rgba(16,185,129,0.25)] hover:-translate-y-1 transition-transform duration-300"
          >
            <div>
              <div className="size-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-6">
                <TrendingUp className="size-6" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">
                Analiza tendencias
              </h2>
              <p className="text-slate-400 text-sm/relaxed">
                Visualiza patrones detallados y evalúa la evolución continua de
                tu salud cardiovascular.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 backdrop-blur-xl p-8 flex flex-col justify-between shadow-[0_0_30px_-10px_rgba(244,63,94,0.25)] hover:-translate-y-1 transition-transform duration-300">
            <div>
              <div className="size-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-6">
                <Upload className="size-6" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">
                Comparte con tu médico
              </h2>
              <p className="text-slate-400 text-sm/relaxed">
                Genera reportes profesionales y consolidados listos para llevar
                a tus consultas médicas.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
