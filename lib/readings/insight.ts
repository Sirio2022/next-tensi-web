export interface InsightLine {
  text: string
  bold: boolean
}

/**
 * Parser mínimo y seguro de una línea de `insight`: divide por `**` y marca los
 * tramos impares como `bold`. Un marker sin cerrar se devuelve tal cual (sin
 * negrita). El componente se encarga de partir el texto en líneas y de mapear
 * los segmentos a nodos de React (prohibido `dangerouslySetInnerHTML`).
 */
export function parseInsight(text: string): InsightLine[] {
  const parts = text.split("**")
  const hasUnclosedMarker = parts.length % 2 === 0
  const pairedLimit = hasUnclosedMarker ? parts.length - 1 : parts.length
  const segments: InsightLine[] = []

  for (let index = 0; index < pairedLimit; index += 1) {
    const part = parts[index]
    if (part.length === 0) continue

    segments.push({ text: part, bold: index % 2 === 1 })
  }

  // Si la línea traía un `**` sin cerrar, se muestra tal cual en vez de negrita.
  if (hasUnclosedMarker) {
    segments.push({ text: `**${parts[parts.length - 1]}`, bold: false })
  }

  return segments
}
