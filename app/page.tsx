import { AuthModalsProvider } from '@/components/site/auth-modals'
import { SiteHeader } from '@/components/site/site-header'
import { SiteFooter } from '@/components/site/site-footer'
import { Hero } from '@/components/landing/hero'
import { Features } from '@/components/landing/features'
import { BpCalculator } from '@/components/landing/bp-calculator'
import { Cta } from '@/components/landing/cta'

/**
 * Landing pública de Tensi (Server Component). Toda la interactividad (modales,
 * calculadora, toasts) vive en componentes cliente hijos; el proveedor de
 * modales envuelve la página para que header, hero y CTA compartan su contexto.
 */
export default function Home() {
  return (
    <AuthModalsProvider>
      <div className="relative flex min-h-screen flex-col bg-slate-950 text-slate-100 antialiased">
        <div aria-hidden="true" className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-250 h-150 bg-[radial-gradient(circle_at_50%_20%,rgba(56,189,248,0.15)_0%,rgba(139,92,246,0.12)_35%,transparent_70%)]" />
          <div className="absolute top-[35%] -left-48 size-96 bg-tensi-500/10 rounded-full blur-[140px]" />
          <div className="absolute top-[55%] -right-48 size-96 bg-tensi-violet/10 rounded-full blur-[140px]" />
        </div>

        <SiteHeader />

        <main className="relative z-10 grow">
          <Hero />
          <Features />
          <BpCalculator />
          <Cta />
        </main>

        <SiteFooter />
      </div>
    </AuthModalsProvider>
  )
}
