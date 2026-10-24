import type { Metadata } from 'next'
import { RegisterForm } from '@/components/auth/register-form'

export const metadata: Metadata = {
  title: 'Crear cuenta',
}

export default function RegisterPage() {
  return (
    <div className="relative rounded-2xl bg-card/60 border border-line p-8 shadow-2xl backdrop-blur-xl hover:border-line-strong transition-all duration-300">
      <div
        aria-hidden="true"
        className="absolute -inset-px rounded-2xl bg-linear-to-b from-tensi-500/10 via-transparent to-transparent pointer-events-none"
      />

      <div className="relative z-10">
        <h1 className="text-2xl font-bold text-center text-fg mb-6 tracking-tight">Crear Cuenta</h1>
        <RegisterForm />
      </div>
    </div>
  )
}
