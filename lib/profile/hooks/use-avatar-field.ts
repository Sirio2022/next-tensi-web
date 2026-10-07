"use client"

import { useCallback, useEffect, useId, useRef, useState } from "react"

/** Tipos aceptados por el `ParseFilePipeBuilder` del back (`image/(jpeg|png|webp)`). */
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"] as const

/** Mismo límite que el back (1 MB). */
const MAX_SIZE = 1024 * 1024

/** Valor para el atributo `accept` del `<input type="file">`. */
export const AVATAR_ACCEPT = ACCEPTED_TYPES.join(",")

function isAcceptedType(type: string): boolean {
  return (ACCEPTED_TYPES as readonly string[]).includes(type)
}

export interface AvatarFieldState {
  inputId: string
  /** Archivo elegido pendiente de subir, o `null` si no se cambió. */
  file: File | null
  /** URL a previsualizar: la del nuevo archivo o la del avatar actual. */
  previewUrl: string | null
  error: string | null
  selectFile: (file: File | null) => void
  clear: () => void
}

/**
 * Estado del campo de avatar: valida tipo y tamaño en el cliente (sin llamar a
 * la API si no cumple), genera la previsualización con `URL.createObjectURL` y
 * revoca la URL al reemplazarla o al desmontar el componente.
 */
export function useAvatarField(initialUrl: string | null): AvatarFieldState {
  const inputId = useId()
  const [file, setFile] = useState<File | null>(null)
  const [objectUrl, setObjectUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const objectUrlRef = useRef<string | null>(null)

  const revoke = useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current)
      objectUrlRef.current = null
    }
  }, [])

  // Limpieza al desmontar: cancela la última URL de objeto creada.
  useEffect(() => revoke, [revoke])

  const selectFile = useCallback(
    (next: File | null) => {
      setError(null)

      if (!next) {
        revoke()
        setObjectUrl(null)
        setFile(null)
        return
      }

      if (!isAcceptedType(next.type)) {
        setError("Formato no válido. Usa una imagen JPG, PNG o WEBP.")
        return
      }

      if (next.size > MAX_SIZE) {
        setError("La imagen no puede superar 1 MB.")
        return
      }

      revoke()
      const url = URL.createObjectURL(next)
      objectUrlRef.current = url
      setObjectUrl(url)
      setFile(next)
    },
    [revoke]
  )

  const clear = useCallback(() => selectFile(null), [selectFile])

  return {
    inputId,
    file,
    previewUrl: objectUrl ?? initialUrl,
    error,
    selectFile,
    clear
  }
}
