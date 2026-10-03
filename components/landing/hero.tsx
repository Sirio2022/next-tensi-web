"use client"

import { useAuthModals } from "@/components/site/auth-modals"
import { ArrowRight } from "lucide-react"

/**
 * Hero de la landing: titular, CTAs que abren los modales y la tarjeta mock del
 * dashboard (estática) con las tendencias del mockup.
 */
export function Hero() {
  const { openLogin, openRegister } = useAuthModals()

  return (
    <section className="relative pt-12 pb-16 md:pt-20 md:pb-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-slate-900/90 border border-tensi-500/30 text-slate-200 text-xs font-medium mb-8 shadow-xl">
          <span className="flex size-2 rounded-full bg-tensi-400 animate-ping motion-reduce:animate-none" />
          <span className="text-tensi-400 font-semibold">
            Salud Cardiovascular Inteligente
          </span>
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.12]">
          Controla tu Presión Arterial
        </h1>

        <p className="mt-6 text-lg/relaxed sm:text-xl text-slate-300 max-w-2xl mx-auto font-normal">
          Registra, analiza y mejora tu salud cardiovascular con un control
          diario sencillo, preciso e intuitivo.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
          <button
            type="button"
            onClick={openRegister}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-linear-to-r from-tensi-500 to-blue-600 hover:from-tensi-400 hover:to-blue-500 text-white font-semibold px-8 py-3.5 rounded-full shadow-xl shadow-tensi-500/25 transition-all duration-300 hover:scale-105"
          >
            <span>Comenzar Gratis</span>
            <ArrowRight className="size-4" />
          </button>

          <button
            type="button"
            onClick={openLogin}
            className="w-full sm:w-auto bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 font-semibold px-8 py-3.5 rounded-full backdrop-blur-md transition-all duration-300"
          >
            Iniciar Sesión
          </button>
        </div>

        <div className="mt-14 max-w-4xl mx-auto relative">
          <div
            aria-hidden="true"
            className="absolute -inset-1 bg-linear-to-r from-tensi-500 via-indigo-500 to-tensi-violet rounded-3xl blur-2xl opacity-20"
          />

          <div className="relative text-left rounded-2xl md:rounded-3xl border border-slate-800 bg-slate-900/70 backdrop-blur-xl p-6 shadow-2xl overflow-hidden">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800">
                <div className="text-slate-400 text-xs">Presión Arterial</div>
                <div className="text-3xl font-bold text-white mt-1">
                  118 / 78{" "}
                  <span className="text-xs text-slate-400 font-normal">
                    mmHg
                  </span>
                </div>
                <span className="inline-block mt-2 text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                  Óptima
                </span>
              </div>
              <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800">
                <div className="text-slate-400 text-xs">
                  Frecuencia Cardíaca
                </div>
                <div className="text-3xl font-bold text-white mt-1">
                  72{" "}
                  <span className="text-xs text-slate-400 font-normal">
                    BPM
                  </span>
                </div>
                <span className="inline-block mt-2 text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold">
                  Reposo Excelente
                </span>
              </div>
              <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800">
                <div className="text-slate-400 text-xs">Monitoreo Semanal</div>
                <div className="text-3xl font-bold text-tensi-400 mt-1">
                  Estable
                </div>
                <span className="inline-block mt-2 text-[10px] px-2 py-0.5 rounded bg-violet-500/10 text-violet-400 border border-violet-500/20 font-semibold">
                  Riesgo Bajo
                </span>
              </div>
            </div>

            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between mb-3 text-xs">
                <span className="font-semibold text-slate-200">
                  Tendencia Cardiovascular
                </span>
                <span className="text-slate-500">Últimos 7 Días</span>
              </div>
              <div className="h-28 w-full relative">
                <svg
                  className="size-full"
                  viewBox="0 0 500 100"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path
                    d="M0,45 Q100,25 200,35 T400,28 T500,38"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={3}
                    className="text-tensi-400"
                  />
                  <path
                    d="M0,75 Q100,68 200,72 T400,70 T500,74"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={3}
                    className="text-tensi-violet"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
