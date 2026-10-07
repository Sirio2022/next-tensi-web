"use client"

import {
  AVATAR_ACCEPT,
  type AvatarFieldState
} from "@/lib/profile/hooks/use-avatar-field"
import { Camera } from "lucide-react"

interface AvatarFieldProps {
  avatar: AvatarFieldState
}

/**
 * Campo de imagen de perfil: previsualización (o icono por defecto), botón
 * etiquetado que abre el selector nativo y mensaje de error del cliente. El
 * estado y la validación viven en `useAvatarField`.
 */
export function AvatarField({ avatar }: Readonly<AvatarFieldProps>) {
  const { inputId, previewUrl, error, selectFile } = avatar

  return (
    <div className="space-y-2">
      <span className="block text-xs font-semibold tracking-wider text-slate-300 uppercase">
        Imagen de Perfil
      </span>

      <div className="flex items-center gap-4">
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt="Previsualización de la imagen de perfil"
            className="size-16 rounded-full object-cover ring-2 ring-slate-800"
          />
        ) : (
          <span className="flex size-16 items-center justify-center rounded-full bg-slate-800 text-slate-500">
            <Camera className="size-6" />
          </span>
        )}

        <label
          htmlFor={inputId}
          className="flex-1 cursor-pointer rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-center text-sm font-medium text-slate-300 transition hover:bg-slate-800/60"
        >
          Seleccionar imagen de perfil
        </label>
        <input
          id={inputId}
          type="file"
          accept={AVATAR_ACCEPT}
          className="sr-only"
          onChange={(event) => selectFile(event.target.files?.[0] ?? null)}
        />
      </div>

      {error ? (
        <p role="alert" className="text-xs text-red-400">
          {error}
        </p>
      ) : null}
    </div>
  )
}
