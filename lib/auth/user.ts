import type { AuthUser } from "@/lib/auth/types"

/**
 * Iniciales para el avatar a partir del `username` (o el email si aquel viniera
 * vacío). Con dos o más palabras toma la inicial de las dos primeras; con una
 * sola, sus dos primeros caracteres.
 */
export function getUserInitials(user: AuthUser): string {
  const source = user.username.trim() || user.email?.trim() || ""
  const parts = source.split(/[\s._-]+/).filter(Boolean)

  if (parts.length >= 2) {
    return `${parts[0]?.charAt(0) ?? ""}${parts[1]?.charAt(0) ?? ""}`.toUpperCase()
  }

  return source.slice(0, 2).toUpperCase() || "?"
}
