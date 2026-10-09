/**
 * Derivaciones puras de la sección "Vista General" (SPEC 18).
 *
 * Vive en la capa portable `lib/…/core/` (SPEC 17): a partir de `AuthUser` y
 * `Plan` compone los textos que la vista presenta (resumen de perfil, médica e
 * información de cuenta). Sin estado, sin Next y sin DOM.
 */

import type { AuthUser, Gender, OAuthProvider, Plan } from "@/lib/auth/types"
import { times100 } from "@/lib/profile/format"

const GENDER_LABELS: Record<Gender, string> = {
  MALE: "Masculino",
  FEMALE: "Femenino",
  OTHER: "Otro"
}

const PROVIDER_LABELS: Record<OAuthProvider, string> = {
  google: "Google",
  github: "GitHub"
}

const EMPTY_VALUE = "Sin especificar"

/** Etiqueta legible del plan para "Información de Cuenta". */
export function describePlanLabel(plan: Plan): string {
  return plan === "PREMIUM" ? "Premium" : "Free"
}

/**
 * Método de acceso a la cuenta: "Email y contraseña" cuando hay contraseña
 * local; si no (OAuth puro), los proveedores vinculados ("Google", "GitHub", o
 * ambos unidos con " y ").
 */
export function describeAuthMethod(
  user: Pick<AuthUser, "hasPassword" | "providers">
): string {
  if (user.hasPassword) return "Email y contraseña"

  const labels = user.providers.map((provider) => PROVIDER_LABELS[provider])
  return labels.length > 0 ? labels.join(" y ") : "No disponible"
}

/** Fecha ISO (o `yyyy-mm-dd`) → "dd/mm/yyyy" sin depender del locale. */
function formatDisplayDate(iso: string | null): string {
  if (!iso) return EMPTY_VALUE

  const [year, month, day] = iso.slice(0, 10).split("-")
  if (!year || !month || !day) return EMPTY_VALUE

  return `${day}/${month}/${year}`
}

/** Estatura en metros (como la guarda el back) → centímetros de la UI. */
function formatHeight(meters: number | null): string {
  return meters === null ? EMPTY_VALUE : `${times100(meters)} cm`
}

/** Peso en kg → "73 kg". */
function formatWeight(kilograms: number | null): string {
  return kilograms === null ? EMPTY_VALUE : `${kilograms} kg`
}

export type ProfileDetailId = "birthDate" | "weight" | "height" | "gender"

/** Ítem del resumen de perfil; la vista resuelve el icono por `id`. */
export interface ProfileDetail {
  id: ProfileDetailId
  label: string
  value: string
}

export interface ProfileSummary {
  displayName: string
  email: string | null
  details: readonly ProfileDetail[]
}

/**
 * Resumen del perfil para el primer bloque de "Vista General": nombre, email y
 * los detalles personales con sus etiquetas legibles.
 */
export function buildProfileSummary(
  user: Pick<
    AuthUser,
    "username" | "email" | "birthDate" | "weight" | "height" | "gender"
  >
): ProfileSummary {
  return {
    displayName: user.username,
    email: user.email,
    details: [
      {
        id: "birthDate",
        label: "Fecha de nacimiento",
        value: formatDisplayDate(user.birthDate)
      },
      {
        id: "weight",
        label: "Peso",
        value: formatWeight(user.weight)
      },
      {
        id: "height",
        label: "Estatura",
        value: formatHeight(user.height)
      },
      {
        id: "gender",
        label: "Género",
        value: user.gender ? GENDER_LABELS[user.gender] : EMPTY_VALUE
      }
    ]
  }
}

export interface AccountSummary {
  userId: string
  planLabel: string
  authMethod: string
}

/** Información de cuenta: id de usuario, tipo de plan y método de acceso. */
export function buildAccountSummary(
  user: Pick<AuthUser, "id" | "plan" | "hasPassword" | "providers">
): AccountSummary {
  return {
    userId: user.id,
    planLabel: describePlanLabel(user.plan),
    authMethod: describeAuthMethod(user)
  }
}
