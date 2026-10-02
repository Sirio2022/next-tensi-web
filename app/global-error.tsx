"use client"

// Los error boundaries deben ser Client Components.
import { useEffect, type CSSProperties } from "react"

interface GlobalErrorProps {
  error: Error & { digest?: string }
  retry: () => void
}

/**
 * `global-error` reemplaza al layout raíz, así que no hereda `globals.css` ni el
 * tema oscuro. Por eso define su propio `<html lang="es">`/`<body>` y los
 * estilos van inline, replicando los tokens `tensi`.
 */
export default function GlobalError({
  error,
  retry
}: Readonly<GlobalErrorProps>) {
  useEffect(() => {
    // Punto de enganche para reportar el error a un servicio externo.
    console.error(error)
  }, [error])

  return (
    <html lang="es">
      <body style={BODY_STYLE}>
        <title>Algo salió mal — Tensi</title>

        <div style={CARD_STYLE}>
          <p style={CODE_STYLE} aria-hidden="true">
            500
          </p>
          <h1 style={HEADING_STYLE}>Algo salió mal</h1>
          <p style={TEXT_STYLE}>
            Ocurrió un error inesperado y no pudimos cargar la página. Puedes
            intentarlo de nuevo.
          </p>
          {error.digest ? (
            <p style={DIGEST_STYLE}>Referencia: {error.digest}</p>
          ) : null}

          <button type="button" onClick={() => retry()} style={BUTTON_STYLE}>
            Reintentar
          </button>
        </div>
      </body>
    </html>
  )
}

const BODY_STYLE: CSSProperties = {
  display: "flex",
  minHeight: "100vh",
  alignItems: "center",
  justifyContent: "center",
  margin: 0,
  padding: "4rem 1.5rem",
  background:
    "radial-gradient(circle at 50% 0%, rgba(56,189,248,0.12) 0%, rgba(139,92,246,0.08) 35%, transparent 70%), #030712",
  color: "#f1f5f9",
  fontFamily:
    "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif"
}

const CARD_STYLE: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "0.75rem",
  maxWidth: "32rem",
  textAlign: "center"
}

const CODE_STYLE: CSSProperties = {
  margin: 0,
  fontSize: "clamp(4rem, 12vw, 6rem)",
  fontWeight: 800,
  lineHeight: 1,
  letterSpacing: "-0.03em",
  background: "linear-gradient(90deg, #38bdf8, #8b5cf6)",
  backgroundClip: "text",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent"
}

const HEADING_STYLE: CSSProperties = {
  margin: 0,
  fontSize: "1.5rem",
  fontWeight: 700,
  color: "#ffffff"
}

const TEXT_STYLE: CSSProperties = {
  margin: 0,
  fontSize: "0.95rem",
  lineHeight: 1.6,
  color: "#94a3b8"
}

const DIGEST_STYLE: CSSProperties = {
  margin: 0,
  fontSize: "0.8rem",
  color: "#64748b"
}

const BUTTON_STYLE: CSSProperties = {
  marginTop: "1rem",
  padding: "0.75rem 1.75rem",
  border: "none",
  borderRadius: "9999px",
  background: "linear-gradient(90deg, #06b6d4, #2563eb)",
  color: "#ffffff",
  fontSize: "0.9rem",
  fontWeight: 600,
  cursor: "pointer"
}
