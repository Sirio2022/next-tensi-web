import type { ReactNode } from "react"

interface SubmitButtonProps {
  isSubmitting: boolean
  children: ReactNode
}

/** Botón de submit compartido por las pantallas de auth. */
export function SubmitButton({
  isSubmitting,
  children
}: Readonly<SubmitButtonProps>) {
  // No usamos `disabled` para no expulsar el foco del botón durante el envío;
  // en su lugar bloqueamos el submit en el `onClick` cuando ya está en curso.
  return (
    <button
      type="submit"
      aria-disabled={isSubmitting}
      aria-busy={isSubmitting}
      onClick={(event) => {
        if (isSubmitting) event.preventDefault()
      }}
      className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-tensi-600 hover:bg-tensi-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-tensi-600/25 transition-all duration-200 active:scale-[0.99] mt-2 aria-disabled:opacity-60 aria-disabled:cursor-not-allowed"
    >
      {isSubmitting ? (
        <>
          <svg
            className="size-4 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          Enviando…
        </>
      ) : (
        children
      )}
    </button>
  )
}
