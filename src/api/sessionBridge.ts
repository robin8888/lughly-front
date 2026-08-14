/**
 * Une el store de sesión con el cliente HTTP.
 *
 * Se llama una sola vez al arrancar la app. Está aparte para que `http.ts`
 * no importe el store (evita el ciclo store → api → store).
 */

import { configureSessionBridge } from './http'
import { useAuthStore } from '@/stores/useAuthStore'

export function setupSessionBridge(): void {
  configureSessionBridge({
    getAccessToken: () => useAuthStore.getState().accessToken,
    getRefreshToken: () => useAuthStore.getState().refreshToken,
    onRefreshed: (accessToken, refreshToken) =>
      useAuthStore.getState().setTokens(accessToken, refreshToken),
    // El backend ha invalidado la sesión: se limpia y la app vuelve al splash
    onSessionExpired: () => useAuthStore.getState().clearAuth(),
  })
}
