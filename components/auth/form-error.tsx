interface FormErrorProps {
  message?: string
}

/** Mensaje de error de API compartido por las pantallas de auth. */
export function FormError({ message }: Readonly<FormErrorProps>) {
  if (!message) return null

  return (
    <p
      role="alert"
      className="text-xs text-tone-rose bg-rose-500/10 border border-rose-500/30 rounded-lg px-3 py-2"
    >
      {message}
    </p>
  )
}
