"use client"

import { useAuth } from "@/lib/auth/hooks/use-auth"

/** Botón de logout: llama a `POST /auth/logout` y vuelve a `/login`. */
export function LogoutButton() {
  const { logout, toMessage } = useAuth()

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        type="button"
        onClick={() => logout.mutate()}
        disabled={logout.isPending}
        aria-busy={logout.isPending}
        className="px-4 py-2.5 rounded-xl bg-card border border-line-strong text-fg hover:text-fg hover:border-line-strong text-sm font-medium transition-colors disabled:opacity-60"
      >
        {logout.isPending ? "Cerrando sesión…" : "Cerrar sesión"}
      </button>
      {logout.isError ? (
        <p role="alert" className="text-xs text-tone-rose">
          {toMessage(logout.error)}
        </p>
      ) : null}
    </div>
  )
}
