const dateTimeFormatter = new Intl.DateTimeFormat("es-ES", {
  dateStyle: "long",
  timeStyle: "short"
})

/** Fecha y hora de una medición en formato largo (día, mes, año y hora). */
export function formatReadingDateTime(date: Date): string {
  return dateTimeFormatter.format(date)
}
