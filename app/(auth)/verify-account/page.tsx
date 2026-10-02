import type { Metadata } from 'next'
import { VerifyAccountForm } from '@/components/auth/verify-account-form'

export const metadata: Metadata = {
  title: 'Verificar cuenta — Tensi',
}

export default async function VerifyAccountPage({ searchParams }: Readonly<PageProps<'/verify-account'>>) {
  const params = await searchParams
  const email = typeof params.email === 'string' ? params.email : undefined

  return (
    <div className="relative rounded-2xl bg-slate-900/60 border border-slate-800/80 p-8 shadow-2xl backdrop-blur-xl hover:border-slate-700/80 transition-all duration-300">
      <div
        aria-hidden="true"
        className="absolute -inset-px rounded-2xl bg-linear-to-b from-tensi-500/10 via-transparent to-transparent pointer-events-none"
      />

      <div className="relative z-10">
        <h1 className="text-2xl font-bold text-center text-white mb-2 tracking-tight">Verificar Cuenta</h1>
        <p className="text-xs/relaxed text-slate-400 text-center mb-6">
          Ingresa el código de 6 dígitos enviado a tu correo
        </p>
        <VerifyAccountForm email={email} />
      </div>
    </div>
  )
}
