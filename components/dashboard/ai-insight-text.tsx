import type { ReactNode } from "react"

interface AiInsightTextProps {
  /** Texto del `insight` del back; puede traer `**negritas**`, saltos y emojis. */
  text: string
  className?: string
}

/**
 * Parser mínimo y seguro del `insight`: convierte `**negritas**` en `<strong>` y
 * cada salto de línea en un `<p>`. **Prohibido** `dangerouslySetInnerHTML`: solo
 * se construyen nodos de React a partir de texto plano.
 */
export function AiInsightText({
  text,
  className = ""
}: Readonly<AiInsightTextProps>) {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)

  return (
    <div className={className}>
      {lines.map((line, index) => (
        <p key={index}>{parseLine(line)}</p>
      ))}
    </div>
  )
}

/** Divide una línea por `**` y envuelve los tramos impares en `<strong>`. */
function parseLine(line: string): ReactNode[] {
  const parts = line.split("**")
  const hasUnclosedMarker = parts.length % 2 === 0
  const nodes: ReactNode[] = []
  const pairedLimit = hasUnclosedMarker ? parts.length - 1 : parts.length

  for (let index = 0; index < pairedLimit; index += 1) {
    const part = parts[index]
    if (part.length === 0) continue

    nodes.push(
      index % 2 === 1 ? (
        <strong key={index} className="font-semibold text-slate-100">
          {part}
        </strong>
      ) : (
        part
      )
    )
  }

  // Si el texto traía un `**` sin cerrar, se muestra tal cual en vez de negrita.
  if (hasUnclosedMarker) {
    nodes.push(`**${parts[parts.length - 1]}`)
  }

  return nodes
}
