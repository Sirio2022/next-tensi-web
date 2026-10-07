import {
  ApiError,
  type ApiErrorBody,
  type HttpClient,
  type HttpRequestOptions
} from "./types"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3002/api"

/**
 * Type guard mínimo del cuerpo de error de la API. Descarta cualquier valor que
 * no sea un objeto para no leer propiedades de `null`/primitivos; la forma
 * concreta de cada campo se valida con `typeof` al consumirlo.
 */
function isApiErrorBody(value: unknown): value is Partial<ApiErrorBody> {
  return typeof value === "object" && value !== null
}

/**
 * Mensaje del error normalizado como string. El filtro de la API puede anidar
 * el mensaje en `response.message` como string o como array, así que se
 * colapsa a un texto legible para la UI.
 */
function normalizeMessage(body: unknown, status: number): string {
  const errorBody = isApiErrorBody(body) ? body : undefined
  const response = errorBody?.response

  if (typeof response === "string" && response.trim()) {
    return response
  }

  if (response && typeof response === "object") {
    if (Array.isArray(response.message)) {
      return response.message.join(", ")
    }
    if (typeof response.message === "string" && response.message.trim()) {
      return response.message
    }
    if (typeof response.error === "string" && response.error.trim()) {
      return response.error
    }
  }

  if (typeof errorBody?.details === "string") return errorBody.details
  if (Array.isArray(errorBody?.details)) return errorBody.details.join(", ")

  return `Error ${status}`
}

function normalizeDetails(body: unknown): string | string[] | undefined {
  const errorBody = isApiErrorBody(body) ? body : undefined
  const details = errorBody?.details

  if (typeof details === "string") return details
  if (Array.isArray(details)) return details.map(String)

  const response = errorBody?.response
  if (
    response &&
    typeof response === "object" &&
    Array.isArray(response.message)
  ) {
    return response.message.map(String)
  }

  return undefined
}

/**
 * Combina la señal del consumidor con un timeout opcional. Si solo hay una de
 * las dos, se devuelve tal cual; si existen ambas, se aborta cuando cualquiera
 * de ellas lo haga mediante `AbortSignal.any`.
 */
function buildSignal(
  signal: AbortSignal | undefined,
  timeout: number | undefined
): AbortSignal | undefined {
  if (timeout === undefined) return signal

  const timeoutSignal = AbortSignal.timeout(timeout)
  return signal ? AbortSignal.any([signal, timeoutSignal]) : timeoutSignal
}

interface ParsedBody {
  value: unknown
  /** `false` cuando el cuerpo no era JSON (p. ej. HTML de un proxy o error) */
  isJson: boolean
}

async function parseBody(response: Response): Promise<ParsedBody> {
  if (response.status === 204) return { value: undefined, isJson: true }

  const text = await response.text()
  if (!text) return { value: undefined, isJson: true }

  try {
    return { value: JSON.parse(text) as unknown, isJson: true }
  } catch {
    return { value: text, isJson: false }
  }
}

/**
 * Implementación de `HttpClient` sobre `fetch`. Es el único punto que toca
 * `fetch`; cambiar de cliente exige reimplementar esta misma interfaz.
 * Siempre envía `credentials: 'include'` para que la cookie viaje en el
 * navegador.
 */
export function createFetchClient(
  getHeaders?: () => Record<string, string>
): HttpClient {
  async function request<T>(
    path: string,
    options: HttpRequestOptions = {}
  ): Promise<T> {
    const { method = "GET", body, headers, signal, cache, timeout } = options
    const requestSignal = buildSignal(signal, timeout)

    // `FormData` no se serializa ni fija `Content-Type`: el navegador debe
    // generar el boundary de `multipart/form-data` por su cuenta.
    const isFormData = body instanceof FormData

    const response = await fetch(`${API_URL}${path}`, {
      method,
      credentials: "include",
      headers: {
        Accept: "application/json",
        ...(body !== undefined && !isFormData
          ? { "Content-Type": "application/json" }
          : {}),
        ...getHeaders?.(),
        ...headers
      },
      ...(body !== undefined
        ? { body: isFormData ? body : JSON.stringify(body) }
        : {}),
      ...(requestSignal ? { signal: requestSignal } : {}),
      ...(cache ? { cache } : {})
    })

    const { value: parsed, isJson } = await parseBody(response)

    if (!response.ok) {
      throw new ApiError(
        normalizeMessage(parsed, response.status),
        response.status,
        normalizeDetails(parsed)
      )
    }

    // Un 2xx con cuerpo no-JSON (HTML de un proxy, texto plano…) nunca debe
    // propagarse como `T`: el contrato de la API es JSON.
    if (!isJson) {
      throw new ApiError(
        "La respuesta del servidor no es JSON válido",
        response.status
      )
    }

    return parsed as T
  }

  return {
    request,
    get: (path, options) => request(path, { ...options, method: "GET" }),
    post: (path, options) => request(path, { ...options, method: "POST" }),
    put: (path, options) => request(path, { ...options, method: "PUT" }),
    patch: (path, options) => request(path, { ...options, method: "PATCH" }),
    delete: (path, options) => request(path, { ...options, method: "DELETE" })
  }
}
