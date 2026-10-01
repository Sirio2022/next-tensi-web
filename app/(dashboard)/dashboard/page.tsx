import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { verifySession } from '@/lib/auth/dal'
import { LogoutButton } from '@/components/auth/logout-button'

export const metadata: Metadata = {
  title: 'Dashboard — Tensi',
}

export default async function DashboardPage() {
  const user = await verifySession()

  if (!user) {
    redirect('/login')
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 px-4 py-12">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard</h1>

        <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-6 space-y-4">
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-slate-400">Usuario</dt>
              <dd className="text-white font-medium">{user.username}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-400">Correo electrónico</dt>
              <dd className="text-white font-medium">{user.email ?? '—'}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-400">Plan</dt>
              <dd className="text-white font-medium">{user.plan}</dd>
            </div>
          </dl>

          <LogoutButton />
        </div>
      </div>
    </main>
  )
}
