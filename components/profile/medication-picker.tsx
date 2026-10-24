"use client"

import { useMedicationPicker } from "@/lib/profile/hooks/use-medication-picker"
import type { ProfileFormValues } from "@/lib/profile/schemas"
import { X } from "lucide-react"
import type { Control } from "react-hook-form"

interface MedicationPickerProps {
  control: Control<ProfileFormValues>
}

/**
 * Selector de medicamentos para hipertensión: chips por grupo predefinido
 * (alternan al hacer click) + grupo "Otros" para las personalizadas (chips
 * removibles) + input libre que añade al presionar Enter o coma. Toda la lógica
 * vive en `useMedicationPicker`; este componente solo renderiza.
 */
export function MedicationPicker({ control }: Readonly<MedicationPickerProps>) {
  const {
    inputId,
    inputValue,
    setInputValue,
    groups,
    known,
    custom,
    toggle,
    remove,
    handleKeyDown
  } = useMedicationPicker(control)

  return (
    <div className="space-y-3">
      <span className="block text-xs font-semibold tracking-wider text-fg-muted uppercase">
        Medicamentos para Hipertensión
      </span>

      <div className="space-y-4 rounded-xl border border-line bg-card/60 p-4">
        {groups.map((group) => (
          <div key={group.id}>
            <span className="mb-2 block text-[10px] font-bold tracking-wider text-fg-muted uppercase">
              {group.label}
            </span>
            <div className="flex flex-wrap gap-2">
              {group.medications.map((medication) => {
                const selected = known.includes(medication)

                return (
                  <button
                    key={medication}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => toggle(medication)}
                    className={`rounded-full border px-3 py-1.5 text-xs transition ${
                      selected
                        ? "border-accent bg-accent text-accent-fg"
                        : "border-line-strong bg-card-muted text-fg-muted hover:border-accent hover:text-accent-text"
                    }`}
                  >
                    {medication}
                  </button>
                )
              })}
            </div>
          </div>
        ))}

        {custom.length > 0 ? (
          <div>
            <span className="mb-2 block text-[10px] font-bold tracking-wider text-fg-muted uppercase">
              Otros
            </span>
            <div className="flex flex-wrap gap-2">
              {custom.map((medication) => (
                <span
                  key={medication}
                  className="inline-flex items-center gap-1 rounded-full border border-accent bg-accent px-3 py-1.5 text-xs text-accent-fg"
                >
                  {medication}
                  <button
                    type="button"
                    onClick={() => remove(medication)}
                    aria-label={`Quitar ${medication}`}
                    className="rounded-full p-0.5 transition hover:bg-accent-hover focus-visible:ring-2 focus-visible:ring-accent-fg focus-visible:outline-none"
                  >
                    <X className="size-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <div className="space-y-2">
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold tracking-wider text-fg-muted uppercase"
        >
          ¿No encuentras tu medicamento?
        </label>
        <input
          id={inputId}
          type="text"
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escribe y presiona Enter (separa por comas)"
          className="w-full rounded-xl border border-line bg-card px-4 py-2.5 text-sm text-fg placeholder-fg-subtle transition focus:border-accent focus:outline-none"
        />
        <p className="text-[11px] text-fg-subtle">
          Puedes agregar múltiples medicamentos separándolos con comas
        </p>
      </div>
    </div>
  )
}
