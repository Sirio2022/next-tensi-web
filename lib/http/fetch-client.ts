import {
  ApiError,
  type ApiErrorBody,
  type HttpClient,
  type HttpRequestOptions
} from "./types"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3002/api"

/**
 * Mensaje del error normalizado como string. El filtro de la API puede anidar
 * el mensaje en `response.message` como string o como array, así que se
 * colapsa a un texto legible para la UI.
 */
function normalizeMessage(body: unknown, status: number): string {
  const errorBody = body as Partial<ApiErrorBody> | undefined
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
  const errorBody = body as Partial<ApiErrorBody> | undefined
  const details = errorBody?.details

  if (typeof details === "string" || Array.isArray(details)) return details

  const response = errorBody?.response
  if (
    response &&
    typeof response === "object" &&
    Array.isArray(response.message)
  ) {
    return response.message
  }

  return undefined
}

async function parseBody(response: Response): Promise<unknown> {
  if (response.status === 204) return undefined

  const text = await response.text()
  if (!text) return undefined

  try {
    return JSON.parse(text) as unknown
  } catch {
    return text
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
    const { method = "GET", body, headers, signal, cache } = options

    const response = await fetch(`${API_URL}${path}`, {
      method,
      credentials: "include",
      headers: {
        Accept: "application/json",
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...getHeaders?.(),
        ...headers
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
      ...(signal ? { signal } : {}),
      ...(cache ? { cache } : {})
    })

    const parsed = await parseBody(response)

    if (!response.ok) {
      throw new ApiError(
        normalizeMessage(parsed, response.status),
        response.status,
        normalizeDetails(parsed)
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
