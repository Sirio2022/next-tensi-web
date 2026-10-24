import { getUserInitials } from "@/lib/auth/user"
import type { AuthUser } from "@/lib/auth/types"

interface UserProfileProps {
  user: AuthUser
}

/** Bloque de perfil del header: avatar (imagen o iniciales), nombre y email. */
export function UserProfile({ user }: Readonly<UserProfileProps>) {
  return (
    <div className="flex items-center gap-3">
      {user.avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={user.avatarUrl}
          alt={`Avatar de ${user.username}`}
          className="size-8 rounded-xl object-cover ring-2 ring-line"
        />
      ) : (
        <span className="flex size-8 items-center justify-center rounded-xl bg-linear-to-br from-accent-hover to-accent text-xs font-bold text-accent-fg">
          {getUserInitials(user)}
        </span>
      )}
      <div className="hidden text-left md:block">
        <p className="text-xs leading-none font-semibold text-fg">
          {user.username}
        </p>
        {user.email ? (
          <p className="mt-0.5 text-[10px] leading-none text-fg-muted">
            {user.email}
          </p>
        ) : null}
      </div>
    </div>
  )
}
