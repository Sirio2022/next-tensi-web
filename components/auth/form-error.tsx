interface FormErrorProps {
  message?: string
}

/** Mensaje de error de API compartido por las pantallas de auth. */
export function FormError({ message }: FormErrorProps) {
  if (!message) return null

  return (
    <p role="alert" className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
      {message}
    </p>
  )
}
