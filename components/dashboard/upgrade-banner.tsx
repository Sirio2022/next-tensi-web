import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

/**
 * Banner de monetización del plan Free. Lleva `id="upgrade"` porque es el
 * destino del scroll de `UpgradeButton` y de los ítems bloqueados del sidebar.
 * `scroll-mt-20` evita que el header sticky lo tape al desplazarse hasta él.
 */
export function UpgradeBanner() {
  return (
    <Card
      id="upgrade"
      tone="upgrade"
      className="relative scroll-mt-20 overflow-hidden p-card"
    >
      <div
        className="pointer-events-none absolute top-0 right-0 size-96 rounded-full bg-accent/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
        <div className="max-w-xl space-y-3">
          <Badge tone="amber">✨ Desbloquea Tensi Premium</Badge>
          <h2 className="text-xl font-bold tracking-tight text-fg">
            Obtén gráficos de evolución y reportes exportables para tu médico
          </h2>
          <p className="text-xs/relaxed text-fg-muted">
            Accede al historial ilimitado, tendencias de presión
            sistólica/diastólica por hora y generación automática de PDFs para
            consulta médica.
          </p>
        </div>

        <div className="shrink-0">
          <Button tone="amber" className="w-full sm:w-auto">
            Actualizar a Premium
          </Button>
        </div>
      </div>
    </Card>
  )
}
