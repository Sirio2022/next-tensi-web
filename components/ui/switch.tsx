import type { ReactNode } from "react"

export type SwitchTone = "primary" | "danger" | "success"
export type SwitchSize = "md" | "sm"

const TRACK_TONE_CLASSES: Record<SwitchTone, string> = {
  primary: "bg-tensi-600",
  danger: "bg-rose-600",
  success: "bg-emerald-500"
}

const TRACK_SIZE_CLASSES: Record<SwitchSize, string> = {
  md: "h-5 w-9",
  sm: "h-4.5 w-8"
}

const THUMB_SIZE_CLASSES: Record<SwitchSize, string> = {
  md: "size-4",
  sm: "size-3.5"
}

const THUMB_CHECKED_CLASSES: Record<SwitchSize, string> = {
  md: "translate-x-4",
  sm: "translate-x-3.5"
}

interface SwitchProps {
  /** Id estable para asociar label, descripción y control. */
  id: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  label: string
  description?: ReactNode
  /** Nota adicional (p. ej. "Disponible próximamente"). */
  note?: string
  disabled?: boolean
  tone?: SwitchTone
  size?: SwitchSize
  className?: string
}

/**
 * Switch accesible y controlado (SPEC 20).
 *
 * Es presentacional: el estado vive en el custom hook de la vista. Usa un
 * `<input type="checkbox" role="switch">` real (teclado, foco y lectores de
 * pantalla nativos) con el track dibujado al lado. El texto visible es el
 * `<label>` asociado; la descripción y la nota se enlazan con
 * `aria-describedby`.
 */
export function Switch({
  id,
  checked,
  onCheckedChange,
  label,
  description,
  note,
  disabled = false,
  tone = "primary",
  size = "md",
  className = ""
}: Readonly<SwitchProps>) {
  const descriptionId = description ? `${id}-description` : undefined
  const noteId = note ? `${id}-note` : undefined
  const describedBy = [descriptionId, noteId].filter(Boolean).join(" ") || undefined

  const trackClasses = checked
    ? TRACK_TONE_CLASSES[tone]
    : "bg-slate-800"

  return (
    <div
      className={`flex items-start justify-between gap-4 ${className}`.trim()}
    >
      <div className="min-w-0">
        <label
          htmlFor={id}
          className="block text-sm font-medium text-slate-200"
        >
          {label}
        </label>
        {description ? (
          <p
            id={descriptionId}
            className="mt-0.5 text-xs/relaxed text-slate-400"
          >
            {description}
          </p>
        ) : null}
        {note ? (
          <p id={noteId} className="mt-1 text-xs font-medium text-amber-400">
            {note}
          </p>
        ) : null}
      </div>

      <label
        htmlFor={id}
        className={`relative inline-flex shrink-0 items-center ${
          disabled ? "cursor-not-allowed" : "cursor-pointer"
        }`}
      >
        <input
          id={id}
          type="checkbox"
          role="switch"
          checked={checked}
          disabled={disabled}
          aria-describedby={describedBy}
          onChange={(event) => onCheckedChange(event.target.checked)}
          className="peer sr-only"
        />
        <span
          aria-hidden="true"
          className={`${TRACK_SIZE_CLASSES[size]} ${trackClasses} relative inline-flex items-center rounded-full transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-tensi-400 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-slate-950 ${
            disabled ? "opacity-50" : ""
          }`.trim()}
        >
          <span
            className={`${THUMB_SIZE_CLASSES[size]} absolute top-0.5 left-0.5 rounded-full bg-white transition-transform ${
              checked ? THUMB_CHECKED_CLASSES[size] : "translate-x-0"
            }`.trim()}
          />
        </span>
      </label>
    </div>
  )
}
