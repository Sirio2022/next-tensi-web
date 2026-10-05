const percentFormatter = new Intl.NumberFormat("es-ES", {
  style: "percent",
  maximumFractionDigits: 0
})

/** Ratio 0–1 → porcentaje localizado. El front solo formatea, no calcula salud. */
export function formatPercent(ratio: number): string {
  return percentFormatter.format(ratio)
}
