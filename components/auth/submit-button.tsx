'use client'

import type { ReactNode } from 'react'

interface SubmitButtonProps {
  isSubmitting: boolean
  children: ReactNode
}

/** Botón de submit compartido por las pantallas de auth. */
export function SubmitButton({ isSubmitting, children }: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={isSubmitting}
      aria-busy={isSubmitting}
      className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-tensi-600 hover:bg-tensi-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-tensi-600/25 transition-all duration-200 active:scale-[0.99] mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {isSubmitting ? (
        <>
          <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Enviando…
        </>
      ) : (
        children
      )}
    </button>
  )
}
