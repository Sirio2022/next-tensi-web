import { READING_CONTEXT_TAGS } from "@/lib/dashboard/reading-form"

interface ContextChipsProps {
  selected: readonly string[]
  onToggle: (tag: string) => void
}

/**
 * Chips de contexto con multiselección. Presentacional: el formulario gobierna
 * qué tags están activos y alterna con `onToggle`. El estado seleccionado usa
 * los tokens `tensi` (mismo tratamiento que el ítem activo del sidebar).
 */
export function ContextChips({
  selected,
  onToggle
}: Readonly<ContextChipsProps>) {
  return (
    <fieldset className="space-y-3 text-center">
      <legend className="text-xs font-medium text-fg-muted">
        Contexto (¿Qué estabas haciendo o sintiendo?)
      </legend>

      <div className="flex flex-wrap justify-center gap-2">
        {READING_CONTEXT_TAGS.map((tag) => {
          const isSelected = selected.includes(tag)

          return (
            <button
              key={tag}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onToggle(tag)}
              className={`rounded-full border px-3.5 py-1.5 text-xs transition-colors focus-visible:ring-2 focus-visible:ring-focus/70 focus-visible:outline-none ${
                isSelected
                  ? "border-accent-line bg-accent-soft font-semibold text-accent-text"
                  : "border-line-strong bg-card-muted/80 text-fg-muted hover:bg-line-strong"
              }`}
            >
              {tag}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}
