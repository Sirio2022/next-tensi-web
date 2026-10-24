import type { Metadata } from 'next'
import { VerifyAccountForm } from '@/components/auth/verify-account-form'

export const metadata: Metadata = {
  title: 'Verificar cuenta',
}

export default async function VerifyAccountPage({ searchParams }: Readonly<PageProps<'/verify-account'>>) {
  const params = await searchParams
  const email = typeof params.email === 'string' ? params.email : undefined

  return (
    <div className="relative rounded-2xl bg-card/60 border border-line p-8 shadow-2xl backdrop-blur-xl hover:border-line-strong transition-all duration-300">
      <div
        aria-hidden="true"
        className="absolute -inset-px rounded-2xl bg-linear-to-b from-tensi-500/10 via-transparent to-transparent pointer-events-none"
      />

      <div className="relative z-10">
        <h1 className="text-2xl font-bold text-center text-fg mb-2 tracking-tight">Verificar Cuenta</h1>
        <p className="text-xs/relaxed text-fg-muted text-center mb-6">
          Ingresa el código de 6 dígitos enviado a tu correo
        </p>
        <VerifyAccountForm email={email} />
      </div>
    </div>
  )
}
