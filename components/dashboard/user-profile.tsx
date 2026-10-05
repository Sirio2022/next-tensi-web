import { getUserInitials } from "@/lib/auth/user"
import type { AuthUser } from "@/lib/auth/types"

interface UserProfileProps {
  user: AuthUser
}

/** Bloque de perfil del header: avatar con iniciales, nombre y email. */
export function UserProfile({ user }: Readonly<UserProfileProps>) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex size-8 items-center justify-center rounded-xl bg-linear-to-br from-tensi-400 to-tensi-600 text-xs font-bold text-white">
        {getUserInitials(user)}
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
