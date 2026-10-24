import type { Metadata } from 'next'
import { ResetPasswordForm } from '@/components/auth/reset-password-form'

export const metadata: Metadata = {
  title: 'Restablecer contraseña',
}

export default async function ResetPasswordPage({ searchParams }: Readonly<PageProps<'/reset-password'>>) {
  const params = await searchParams
  const email = typeof params.email === 'string' ? params.email : undefined

  return (
    <div className="relative rounded-2xl bg-card/60 border border-line p-8 shadow-2xl backdrop-blur-xl hover:border-line-strong transition-all duration-300">
      <div
        aria-hidden="true"
        className="absolute -inset-px rounded-2xl bg-linear-to-b from-tensi-500/10 via-transparent to-transparent pointer-events-none"
      />

      <div className="relative z-10">
        <h1 className="text-2xl font-bold text-center text-fg mb-2 tracking-tight">
          Restablecer Contraseña
        </h1>
        <p className="text-xs/relaxed text-fg-muted text-center mb-6">
          Ingresa el código que te enviamos junto con tu nueva contraseña.
        </p>
        <ResetPasswordForm email={email} />
      </div>
    </div>
  )
}
