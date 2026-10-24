import { Activity, TrendingUp, Upload } from "lucide-react"

/** Sección de features de la landing. `#tendencias` apunta a la tarjeta "Analiza". */
export function Features() {
  return (
    <section
      id="caracteristicas"
      className="scroll-mt-20 py-16 bg-card/30 border-t border-line"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-line bg-card/70 backdrop-blur-xl p-8 flex flex-col justify-between shadow-xl shadow-sky-500/10 hover:-translate-y-1 transition-transform duration-300">
            <div>
              <div className="size-12 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-tone-sky mb-6">
                <Activity className="size-6" />
              </div>
              <h2 className="text-xl font-bold text-fg mb-2">
                Registra tus mediciones
              </h2>
              <p className="text-fg-muted text-sm/relaxed">
                Lleva un control preciso de tu presión arterial diariamente de
                forma intuitiva y rápida.
              </p>
            </div>
          </div>

          <div
            id="tendencias"
            className="scroll-mt-20 rounded-2xl border border-line bg-card/70 backdrop-blur-xl p-8 flex flex-col justify-between shadow-xl shadow-emerald-500/10 hover:-translate-y-1 transition-transform duration-300"
          >
            <div>
              <div className="size-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-tone-emerald mb-6">
                <TrendingUp className="size-6" />
              </div>
              <h2 className="text-xl font-bold text-fg mb-2">
                Analiza tendencias
              </h2>
              <p className="text-fg-muted text-sm/relaxed">
                Visualiza patrones detallados y evalúa la evolución continua de
                tu salud cardiovascular.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-card/70 backdrop-blur-xl p-8 flex flex-col justify-between shadow-xl shadow-rose-500/10 hover:-translate-y-1 transition-transform duration-300">
            <div>
              <div className="size-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-tone-rose mb-6">
                <Upload className="size-6" />
              </div>
              <h2 className="text-xl font-bold text-fg mb-2">
                Comparte con tu médico
              </h2>
              <p className="text-fg-muted text-sm/relaxed">
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
