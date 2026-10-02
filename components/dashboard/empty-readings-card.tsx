import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

/**
 * Estado vacío del plan Free: bienvenida y CTA para la primera medición.
 * El CTA aún no tiene acción (la integración entra en otra spec).
 */
export function EmptyReadingsCard() {
  return (
    <Card className="relative overflow-hidden p-8 text-center">
      <div
        className="absolute -top-24 -right-24 size-64 rounded-full bg-tensi-500/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-md space-y-4">
        <div className="mx-auto flex size-16 items-center justify-center rounded-2xl border border-tensi-500/20 bg-tensi-500/10 text-tensi-400 shadow-inner">
          <svg
            className="size-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        </div>

        <h3 className="text-xl font-bold tracking-tight text-white">
          ¡Bienvenido a tu control de presión!
        </h3>
        <p className="text-xs/relaxed text-slate-400">
          Registra tu primera medición de hoy para obtener el cálculo automático
          de tu categoría médica y tu resumen diario.
        </p>

        <div className="pt-2">
          <Button tone="gradient">Agregar mi primera medición</Button>
        </div>
      </div>
    </Card>
  )
}
