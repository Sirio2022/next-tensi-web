import { AiAnalysisCard } from "@/components/dashboard/ai-analysis-card"
import { NewReadingForm } from "@/components/dashboard/new-reading-form"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Nueva Lectura"
}

/**
 * Pantalla de Nueva Lectura (plan Free). Server Component: hereda el shell de
 * `(dashboard)` (sidebar + header) y solo compone el formulario visual y la
 * tarjeta de Análisis IA. No lee datos ni llama a la API.
 */
export default function NewReadingPage() {
  return (
    <div className="mx-auto w-full max-w-2xl space-y-8">
      <h1 className="text-center text-2xl font-bold tracking-tight text-slate-100">
        Agregar Nueva Lectura
      </h1>

      <NewReadingForm />

      <AiAnalysisCard />
    </div>
  )
}
