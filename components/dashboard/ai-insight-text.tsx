import { parseInsight } from "@/lib/readings/insight"

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
        <p key={index}>
          {parseInsight(line).map((segment, segmentIndex) =>
            segment.bold ? (
              <strong
                key={segmentIndex}
                className="font-semibold text-slate-100"
              >
                {segment.text}
              </strong>
            ) : (
              segment.text
            )
          )}
        </p>
      ))}
    </div>
  )
}
