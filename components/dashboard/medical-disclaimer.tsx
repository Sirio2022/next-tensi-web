/** Aviso médico del dashboard, como nota informativa (`role="note"`). */
export function MedicalDisclaimer() {
  return (
    <div
      role="note"
      className="flex items-start gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-xs text-amber-200/90"
    >
      <svg
        className="mt-0.5 size-5 shrink-0 text-amber-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
      <p className="leading-relaxed">
        <strong className="font-semibold text-amber-300">Aviso Médico:</strong>{' '}
        Tensi es una herramienta para monitoreo personal de la presión arterial y
        no sustituye el consejo o diagnóstico médico profesional. Ante cualquier
        síntoma, consulta siempre con un profesional de la salud.
      </p>
    </div>
  )
}
