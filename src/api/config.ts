/**
 * Resolución de la URL del backend.
 *
 * En un móvil físico `localhost` apunta al propio teléfono, así que en
 * desarrollo se deduce la IP del PC a partir del host desde el que Metro
 * está sirviendo el bundle (`hostUri`). Así funciona sin configurar nada
 * al cambiar de red o de máquina.
 *
 * Para fijarla a mano, crea `apps/mobile/.env`:
 *   EXPO_PUBLIC_API_URL=http://192.168.1.50:3000
 */

import Constants from 'expo-constants'

const DEFAULT_API_PORT = 3000

function fromExpoHost(): string | null {
  const hostUri = Constants.expoConfig?.hostUri

  if (!hostUri) return null

  const host = hostUri.split(':')[0]
  if (!host) return null

  return `http://${host}:${DEFAULT_API_PORT}`
}

export function resolveApiBaseUrl(): string {
  const configured = process.env.EXPO_PUBLIC_API_URL?.trim()
  if (configured) return configured.replace(/\/+$/, '')

  return fromExpoHost() ?? `http://localhost:${DEFAULT_API_PORT}`
}

export const API_BASE_URL = resolveApiBaseUrl()

/** Tiempo máximo por petición. Sin esto una red mala deja la UI colgada. */
export const API_TIMEOUT_MS = 15_000
