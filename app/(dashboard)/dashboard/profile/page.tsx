import { redirect } from "next/navigation"

/**
 * El editor de perfil se mudó bajo el shell de Configuración (SPEC 18). Esta
 * ruta queda como redirect permanente a `/dashboard/settings/profile` para no
 * romper enlaces ni marcadores antiguos.
 */
export default function ProfileRedirectPage() {
  redirect("/dashboard/settings/profile")
}
