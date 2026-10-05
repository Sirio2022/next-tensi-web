import { NewReadingForm } from "@/components/dashboard/new-reading-form"
import { verifySession } from "@/lib/auth/dal"
import type { Metadata } from "next"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "Nueva Lectura"
}

/**
 * Pantalla de Nueva Lectura. Server Component: resuelve la sesión (memoizada
 * con `cache()`, comparte la llamada del layout) y pasa el plan al formulario
 * para que la tarjeta IA se adapte a Premium o Free.
 */
export default async function NewReadingPage() {
  const user = await verifySession()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-8">
      <h1 className="text-center text-2xl font-bold tracking-tight text-slate-100">
        Agregar Nueva Lectura
      </h1>

      <NewReadingForm isPremium={user.plan === "PREMIUM"} />
    </div>
  )
}
