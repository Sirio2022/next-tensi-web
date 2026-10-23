import { Button } from "@/components/ui/button"
import { Bell } from "lucide-react"

interface NotificationsHeaderProps {
  isDirty: boolean
  isSaving: boolean
}

/**
 * Cabecera de la sección Notificaciones (SPEC 20). El botón vive dentro del
 * `<form>` de la vista y solo se habilita cuando hay cambios sin guardar.
 */
export function NotificationsHeader({
  isDirty,
  isSaving
}: Readonly<NotificationsHeaderProps>) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 className="flex items-center gap-2 text-sm font-bold text-white">
          <Bell className="size-4 text-tensi-400" aria-hidden />
          Notificaciones y Alertas
        </h2>
        <p className="mt-0.5 text-[11px] text-slate-400">
          Configura cómo y cuándo quieres recibir recordatorios y alertas
        </p>
      </div>

      <Button type="submit" size="sm" disabled={!isDirty || isSaving}>
        {isSaving ? "Guardando…" : "Guardar Cambios"}
      </Button>
    </div>
  )
}
