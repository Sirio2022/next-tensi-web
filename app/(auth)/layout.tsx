import { AuthFooter } from '@/components/auth/auth-footer'
import { AuthHeader } from '@/components/auth/auth-header'

/**
 * Shell compartido de las pantallas de auth: fondo con glows, header y footer
 * de los mockups. Las páginas sólo aportan su tarjeta (`max-w-md`).
 */
export default function AuthLayout({ children }: LayoutProps<'/'>) {
  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen flex flex-col justify-between selection:bg-tensi-500 selection:text-white antialiased relative overflow-x-hidden">
      <div
        aria-hidden="true"
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-tensi-600/15 via-tensi-violet/10 to-transparent blur-3xl pointer-events-none z-0"
      />
      <div
        aria-hidden="true"
        className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-tensi-400/5 blur-[120px] pointer-events-none z-0"
      />

      <AuthHeader />

      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">{children}</div>
      </main>

      <AuthFooter />
    </div>
  )
}
