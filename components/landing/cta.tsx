"use client"

import { useAuthModals } from "@/components/site/auth-modals"

/** CTA final de la landing: abre el modal de registro. */
export function Cta() {
  const { openRegister } = useAuthModals()

  return (
    <section className="py-16">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <div className="relative overflow-hidden rounded-3xl border border-tensi-500/30 bg-card/70 backdrop-blur-xl p-8 sm:p-12 shadow-2xl">
          <div
            aria-hidden="true"
            className="absolute -top-20 left-1/2 -translate-x-1/2 size-80 bg-tensi-500/20 rounded-full blur-3xl pointer-events-none"
          />

          <h2 className="relative z-10 text-3xl sm:text-4xl font-extrabold tracking-tight text-fg">
            ¿Listo para comenzar?
          </h2>
          <p className="relative z-10 mt-4 text-fg-muted text-sm max-w-lg mx-auto">
            Crea tu cuenta en Tensi para comenzar a cuidar tu salud
            cardiovascular hoy mismo.
          </p>

          <div className="relative z-10 mt-8">
            <button
              type="button"
              onClick={openRegister}
              className="bg-linear-to-r from-accent to-tensi-500 hover:from-accent-hover hover:to-tensi-400 text-accent-fg font-bold text-sm px-8 py-3.5 rounded-full shadow-lg shadow-accent/30 transition-all hover:scale-105"
            >
              Crear Cuenta Gratis
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
