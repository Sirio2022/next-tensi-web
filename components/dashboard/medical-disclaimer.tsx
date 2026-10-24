import { TriangleAlert } from "lucide-react"

/** Aviso médico del dashboard, como nota informativa (`role="note"`). */
export function MedicalDisclaimer() {
  return (
    <div
      role="note"
      className="flex items-start gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-xs text-tone-amber"
    >
      <TriangleAlert className="mt-0.5 size-5 shrink-0 text-tone-amber" />
      <p className="leading-relaxed">
        <strong className="font-semibold text-tone-amber">Aviso Médico:</strong>{" "}
        Tensi es una herramienta para monitoreo personal de la presión arterial
        y no sustituye el consejo o diagnóstico médico profesional. Ante
        cualquier síntoma, consulta siempre con un profesional de la salud.
      </p>
    </div>
  )
}
