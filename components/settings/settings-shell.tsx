import { Settings } from "lucide-react"
import type { Plan } from "@/lib/auth/types"
import type { ReactNode } from "react"
import { SettingsSectionNav } from "./settings-section-nav"

interface SettingsShellProps {
  plan: Plan
  children: ReactNode
}

/**
 * Shell de Configuración (SPEC 18): título, sub-sidebar de secciones y
 * contenedor de contenido. El sub-sidebar vive dentro del `<main>` del dashboard,
 * no reemplaza al sidebar principal. En móvil (375 px) apila en una columna; desde
 * `md` usa 4/8 columnas.
 */
export function SettingsShell({
  plan,
  children
}: Readonly<SettingsShellProps>) {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-xl font-bold text-white">
          <Settings className="size-5 text-slate-300" aria-hidden />
          Configuración
        </h1>
        <p className="mt-1 text-xs text-slate-400">
          Personaliza tu experiencia y ajusta tus preferencias
        </p>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-12">
        <div className="md:col-span-4">
          <SettingsSectionNav plan={plan} />
        </div>
        <div className="space-y-4 md:col-span-8">{children}</div>
      </div>
    </div>
  )
}
