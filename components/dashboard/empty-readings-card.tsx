import { ButtonLink } from "@/components/ui/button-link"
import { Card } from "@/components/ui/card"
import { Zap } from "lucide-react"

/**
 * Estado vacío del plan Free: bienvenida y CTA para la primera medición.
 * El CTA navega a Nueva Lectura.
 */
export function EmptyReadingsCard() {
  return (
    <Card className="relative overflow-hidden p-card text-center">
      <div
        className="absolute -top-24 -right-24 size-64 rounded-full bg-accent-soft blur-3xl"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-md space-y-4">
        <div className="mx-auto flex size-16 items-center justify-center rounded-2xl border border-accent-line bg-accent-soft text-accent-text shadow-inner">
          <Zap className="size-8" />
        </div>

        <h2 className="text-xl font-bold tracking-tight text-fg">
          ¡Bienvenido a tu control de presión!
        </h2>
        <p className="text-xs/relaxed text-fg-muted">
          Registra tu primera medición de hoy para obtener el cálculo automático
          de tu categoría médica y tu resumen diario.
        </p>

        <div className="pt-2">
          <ButtonLink href="/dashboard/new-reading" tone="gradient">
            Agregar mi primera medición
          </ButtonLink>
        </div>
      </div>
    </Card>
  )
}
