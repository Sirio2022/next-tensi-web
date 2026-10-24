import { Switch } from "@/components/ui/switch"
import type { AppearanceFormValues } from "@/lib/appearance/core/types"
import { Eye } from "lucide-react"
import { AppearanceCard } from "./appearance-card"

interface AdvancedSectionProps {
  values: AppearanceFormValues
  disabled: boolean
  onChange: (patch: Partial<AppearanceFormValues>) => void
}

/**
 * Bloque "Configuraciones Avanzadas" (SPEC 22). Tres `Switch` accesibles que
 * previsualizan densidad, movimiento y contraste al instante.
 */
export function AdvancedSection({
  values,
  disabled,
  onChange
}: Readonly<AdvancedSectionProps>) {
  return (
    <AppearanceCard
      title="Configuraciones Avanzadas"
      description="Ajustes adicionales para mejorar tu experiencia"
      icon={Eye}
    >
      <div className="space-y-4 pt-1">
        <Switch
          id="appearance-compact-mode"
          checked={values.density === "compact"}
          onCheckedChange={(checked) =>
            onChange({ density: checked ? "compact" : "comfortable" })
          }
          label="Modo compacto"
          description="Reduce el espaciado para mostrar más información"
          disabled={disabled}
        />

        <Switch
          id="appearance-animations"
          checked={values.motion === "full"}
          onCheckedChange={(checked) =>
            onChange({ motion: checked ? "full" : "reduced" })
          }
          label="Animaciones"
          description="Efectos de transición y animaciones suaves"
          disabled={disabled}
        />

        <Switch
          id="appearance-high-contrast"
          checked={values.contrast === "high"}
          onCheckedChange={(checked) =>
            onChange({ contrast: checked ? "high" : "normal" })
          }
          label="Alto contraste"
          description="Mejora la visibilidad para usuarios con dificultades visuales"
          disabled={disabled}
        />
      </div>
    </AppearanceCard>
  )
}
