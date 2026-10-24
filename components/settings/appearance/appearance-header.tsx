import { Button } from "@/components/ui/button"
import { Palette } from "lucide-react"

interface AppearanceHeaderProps {
  isDirty: boolean
  isSaving: boolean
}

/**
 * Cabecera de la sección Apariencia (SPEC 22). El botón vive dentro del
 * `<form>` de la vista y solo se habilita cuando hay cambios sin guardar.
 */
export function AppearanceHeader({
  isDirty,
  isSaving
}: Readonly<AppearanceHeaderProps>) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 className="flex items-center gap-2 text-sm font-bold text-fg">
          <Palette className="size-4 text-accent-text" aria-hidden />
          Apariencia e Interfaz
        </h2>
        <p className="mt-0.5 text-[11px] text-fg-muted">
          Personaliza la apariencia de la aplicación a tu gusto
        </p>
      </div>

      <Button type="submit" size="sm" disabled={!isDirty || isSaving}>
        {isSaving ? "Guardando…" : "Guardar Cambios"}
      </Button>
    </div>
  )
}
