"use client"

import { FormError } from "@/components/auth/form-error"
import { SubmitButton } from "@/components/auth/submit-button"
import { FormField } from "@/components/form/form-field"
import { SelectField, type SelectOption } from "@/components/form/select-field"
import type { AuthUser } from "@/lib/auth/types"
import { useProfileForm } from "@/lib/profile/hooks/use-profile-form"
import { FormProvider } from "react-hook-form"
import { AvatarField } from "./avatar-field"
import { MedicationPicker } from "./medication-picker"

const GENDER_OPTIONS: readonly SelectOption[] = [
  { value: "MALE", label: "Masculino" },
  { value: "FEMALE", label: "Femenino" },
  { value: "OTHER", label: "Otro" }
]

interface ProfileFormProps {
  user: AuthUser
}

/**
 * Formulario de datos personales. El email es de solo lectura (el back no lo
 * acepta en `PATCH /users/profile` y no se envía). El estado y el wiring viven
 * en `useProfileForm`.
 */
export function ProfileForm({ user }: Readonly<ProfileFormProps>) {
  const { onSubmit, isSubmitting, rootError, avatar, ...form } =
    useProfileForm(user)

  return (
    <FormProvider {...form}>
      <form
        onSubmit={onSubmit}
        noValidate
        aria-busy={isSubmitting}
        className="space-y-6"
      >
        <FormField
          name="username"
          label="Nombre de Usuario"
          autoComplete="username"
        />

        <div>
          <label
            htmlFor="profile-email"
            className="mb-2 block text-xs font-semibold tracking-wider text-slate-300 uppercase"
          >
            Correo Electrónico
          </label>
          <input
            id="profile-email"
            type="email"
            value={user.email ?? ""}
            disabled
            readOnly
            className="w-full rounded-xl border border-slate-500 bg-slate-950/80 px-4 py-3 text-sm text-white disabled:opacity-60"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            name="birthDate"
            label="Fecha de Nacimiento"
            type="date"
            className="scheme-dark"
          />
          <SelectField
            name="gender"
            label="Género"
            options={GENDER_OPTIONS}
            placeholder="Seleccionar..."
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            name="weight"
            label="Peso (kg)"
            type="number"
            inputMode="decimal"
            placeholder="Ej. 75"
          />
          <FormField
            name="height"
            label="Estatura (cm)"
            type="number"
            inputMode="decimal"
            placeholder="Ej. 175"
          />
        </div>

        <MedicationPicker control={form.control} />
        <AvatarField avatar={avatar} />

        <FormError message={rootError} />

        <SubmitButton isSubmitting={isSubmitting}>Guardar Cambios</SubmitButton>
      </form>
    </FormProvider>
  )
}
