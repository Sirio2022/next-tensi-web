/**
 * Forma estandarizada de error que devuelve el `AllExceptionsFilter` de la API Nest.
 * El mensaje puede venir como string o como array (validaciones de class-validator).
 */
export interface ApiErrorBody {
  statusCode: number
  timestamp: string
  path: string
  response: string | { message?: string | string[]; error?: string }
  details?: string | string[]
}

/**
 * Error normalizado que expone el adaptador HTTP. Cualquier implementación de
 * `HttpClient` debe lanzar este tipo, nunca errores crudos de `fetch`.
 */
export class ApiError extends Error {
  readonly status: number
  readonly details?: string | string[]

  constructor(message: string, status: number, details?: string | string[]) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.details = details
  }
}

export interface HttpRequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
  body?: unknown
  /**
   * Headers adicionales para la request. En server-side se usa para reenviar
   * la cookie entrante hacia la API.
   */
  headers?: Record<string, string>
  signal?: AbortSignal
  cache?: RequestCache
}

/**
 * Contrato único de acceso HTTP de la app. Toda la aplicación depende de esta
 * interfaz, nunca de `fetch` directo, para poder cambiar de cliente sin tocar
 * los consumidores.
 */
export interface HttpClient {
  request<T>(path: string, options?: HttpRequestOptions): Promise<T>
  get<T>(path: string, options?: HttpRequestOptions): Promise<T>
  post<T>(path: string, options?: HttpRequestOptions): Promise<T>
  put<T>(path: string, options?: HttpRequestOptions): Promise<T>
  patch<T>(path: string, options?: HttpRequestOptions): Promise<T>
  delete<T>(path: string, options?: HttpRequestOptions): Promise<T>
}
