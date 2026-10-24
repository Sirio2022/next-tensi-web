import { LoaderCircle } from "lucide-react"
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
      className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-accent hover:bg-accent-hover text-accent-fg font-semibold text-sm rounded-xl shadow-lg shadow-accent/25 transition-all duration-200 active:scale-[0.99] mt-2 aria-disabled:opacity-60 aria-disabled:cursor-not-allowed"
    >
      {isSubmitting ? (
        <>
          <LoaderCircle className="size-4 animate-spin" />
          Enviando…
        </>
      ) : (
        children
      )}
    </button>
  )
}
