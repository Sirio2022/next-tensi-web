import type { Metadata } from 'next'
import { LoginForm } from '@/components/auth/login-form'

export const metadata: Metadata = {
  title: 'Iniciar sesión — Tensi',
}

export default function LoginPage() {
  return (
    <div className="relative rounded-2xl bg-slate-900/60 border border-slate-800/80 p-8 shadow-2xl backdrop-blur-xl hover:border-slate-700/80 transition-all duration-300">
      <div
        aria-hidden="true"
        className="absolute -inset-px rounded-2xl bg-linear-to-b from-tensi-500/10 via-transparent to-transparent pointer-events-none"
      />

      <div className="relative z-10">
        <h1 className="text-2xl font-bold text-center text-white mb-6 tracking-tight">Iniciar Sesión</h1>
        <LoginForm />
      </div>
    </div>
  )
}
