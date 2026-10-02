import type { AuthUser } from '@/lib/auth/types'

interface UserProfileProps {
  user: AuthUser
}

/**
 * Iniciales para el avatar a partir del `username` (o el email si aquel viniera
 * vacío). Con dos o más palabras toma la inicial de las dos primeras; con una
 * sola, sus dos primeros caracteres.
 */
function getInitials(user: AuthUser): string {
  const source = user.username.trim() || user.email?.trim() || ''
  const parts = source.split(/[\s._-]+/).filter(Boolean)

  if (parts.length >= 2) {
    return `${parts[0]?.charAt(0) ?? ''}${parts[1]?.charAt(0) ?? ''}`.toUpperCase()
  }

  return source.slice(0, 2).toUpperCase() || '?'
}

/** Bloque de perfil del header: avatar con iniciales, nombre y email. */
export function UserProfile({ user }: Readonly<UserProfileProps>) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex size-8 items-center justify-center rounded-xl bg-linear-to-br from-tensi-400 to-tensi-600 text-xs font-bold text-white">
        {getInitials(user)}
      </span>
      <div className="hidden text-left md:block">
        <p className="text-xs leading-none font-semibold text-white">
          {user.username}
        </p>
        {user.email ? (
          <p className="mt-0.5 text-[10px] leading-none text-slate-400">
            {user.email}
          </p>
        ) : null}
      </div>
    </div>
  )
}
