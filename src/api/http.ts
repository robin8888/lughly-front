/**
 * Cliente HTTP de Lughly.
 *
 * Responsabilidades:
 * - Añadir el access token a las peticiones autenticadas.
 * - Renovar la sesión automáticamente ante un 401 y reintentar UNA vez.
 * - Serializar una sola renovación aunque fallen varias peticiones a la vez.
 * - Traducir cualquier fallo a ApiError / NetworkError.
 *
 * OWASP M3: los tokens salen del store (SecureStore) y nunca se registran en logs.
 */

import { API_BASE_URL, API_TIMEOUT_MS } from './config'
import { ApiError, NetworkError, type ApiErrorBody } from './ApiError'

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  body?: unknown
  /** Adjunta el access token y renueva la sesión si caduca */
  auth?: boolean
  signal?: AbortSignal
}

/**
 * El cliente no importa el store directamente: lo recibe inyectado.
 * Evita el ciclo store → api → store y hace el módulo testeable.
 */
export interface SessionBridge {
  getAccessToken: () => string | null
  getRefreshToken: () => string | null
  onRefreshed: (accessToken: string, refreshToken: string) => void
  onSessionExpired: () => void
}

let sessionBridge: SessionBridge | null = null

export function configureSessionBridge(bridge: SessionBridge): void {
  sessionBridge = bridge
}

/** Renovación en curso, compartida por todas las peticiones que fallen a la vez. */
let refreshInFlight: Promise<string | null> | null = null

async function parseBody(response: Response): Promise<unknown> {
  if (response.status === 204) return null

  const text = await response.text()
  if (!text) return null

  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

async function rawRequest(
  path: string,
  options: RequestOptions,
  accessToken: string | null,
): Promise<Response> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), API_TIMEOUT_MS)

  // Si quien llama trae su propio signal, se propaga la cancelación
  const externalAbort = () => controller.abort()
  options.signal?.addEventListener('abort', externalAbort)

  try {
    return await fetch(`${API_BASE_URL}${path}`, {
      method: options.method ?? 'GET',
      headers: {
        Accept: 'application/json',
        ...(options.body !== undefined
          ? { 'Content-Type': 'application/json' }
          : {}),
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      signal: controller.signal,
    })
  } catch {
    throw new NetworkError()
  } finally {
    clearTimeout(timeout)
    options.signal?.removeEventListener('abort', externalAbort)
  }
}

/**
 * Renueva la sesión. Si ya hay una renovación en marcha, se espera a esa
 * en vez de lanzar otra: dos refresh simultáneos con rotación harían que el
 * backend detectara reutilización y cerrara la sesión entera.
 *
 * Se exporta porque la subida de ficheros va por su propio camino (multipart)
 * y necesita exactamente esta misma renovación; si tuviera la suya, dos
 * peticiones simultáneas dispararían la detección de robo de token.
 */
export async function refreshSession(): Promise<string | null> {
  if (refreshInFlight) return refreshInFlight

  refreshInFlight = (async () => {
    const refreshToken = sessionBridge?.getRefreshToken()
    if (!refreshToken) return null

    try {
      const response = await rawRequest(
        '/v1/auth/refresh',
        { method: 'POST', body: { refreshToken } },
        null,
      )

      if (!response.ok) {
        sessionBridge?.onSessionExpired()
        return null
      }

      const session = (await parseBody(response)) as {
        accessToken: string
        refreshToken: string
      }

      sessionBridge?.onRefreshed(session.accessToken, session.refreshToken)
      return session.accessToken
    } catch {
      // Fallo de red: NO se cierra la sesión, puede ser algo temporal
      return null
    } finally {
      refreshInFlight = null
    }
  })()

  return refreshInFlight
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const useAuth = options.auth ?? false
  let accessToken = useAuth ? (sessionBridge?.getAccessToken() ?? null) : null

  let response = await rawRequest(path, options, accessToken)

  if (response.status === 401 && useAuth) {
    accessToken = await refreshSession()

    if (accessToken) {
      response = await rawRequest(path, options, accessToken)
    } else {
      sessionBridge?.onSessionExpired()
    }
  }

  const body = await parseBody(response)

  if (!response.ok) {
    throw new ApiError(
      response.status,
      (body ?? {}) as ApiErrorBody,
    )
  }

  return body as T
}
