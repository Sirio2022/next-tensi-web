import { passwordSchema } from "@/lib/auth/schemas"
import { z } from "zod"

/**
 * Schemas zod del dominio de perfil. Son la única fuente de validación del
 * cliente y replican las reglas del back (`UpdateProfileDto` y
 * `UpdatePasswordDto` de la API Nest). La política de contraseña se reutiliza
 * desde `lib/auth/schemas.ts` para no duplicarla.
 */

export const profileSchema = z.object({
  username: z
    .string()
    .min(2, "El nombre de usuario debe tener al menos 2 caracteres"),
  birthDate: z.string().optional(),
  // El `<select>` de género usa `""` como opción "Seleccionar...".
  gender: z
    .enum(["MALE", "FEMALE", "OTHER"])
    .or(z.literal(""))
    .optional(),
  weight: z.number().positive("El peso debe ser mayor que 0").optional(),
  height: z.number().positive("La estatura debe ser mayor que 0").optional(),
  medications: z.array(z.string())
})

export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, "La contraseña actual es obligatoria"),
    newPassword: passwordSchema,
    confirmNewPassword: z.string().min(1, "Confirma la nueva contraseña")
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    error: "Las contraseñas no coinciden",
    path: ["confirmNewPassword"]
  })

export type ProfileFormValues = z.infer<typeof profileSchema>
export type PasswordChangeFormValues = z.infer<typeof passwordChangeSchema>
