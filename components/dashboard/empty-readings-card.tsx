import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Zap } from "lucide-react"

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
          <Zap className="size-8" />
        </div>

        <h2 className="text-xl font-bold tracking-tight text-white">
          ¡Bienvenido a tu control de presión!
        </h2>
        <p className="text-xs/relaxed text-slate-400">
          Registra tu primera medición de hoy para obtener el cálculo automático
          de tu categoría médica y tu resumen diario.
        </p>

        <div className="pt-2">
          <Button tone="gradient" disabled>
            Agregar mi primera medición
          </Button>
          <p className="mt-2 text-[10px] text-slate-500">
            Disponible cuando se habilite el registro de mediciones.
          </p>
        </div>
      </div>
    </Card>
  )
}
