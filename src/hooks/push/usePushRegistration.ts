/**
 * usePushRegistration
 * Registra este móvil para recibir avisos, y lo suelta al cerrar sesión.
 *
 * El identificador lo da Expo y es **del aparato, no de la persona**: un
 * teléfono se vende o se hereda. El backend lo reasigna al entrar otra
 * cuenta, y aquí se suelta al salir; entre las dos cosas, nadie recibe los
 * avisos del dueño anterior.
 *
 * Nada de esto puede romper la sesión. Si el usuario niega el permiso, si el
 * móvil no tiene servicios de notificación o si la llamada falla, la app
 * funciona igual: los avisos son un extra sobre las listas, que siguen siendo
 * la verdad. Por eso todo va envuelto y no se enseña ningún error.
 */

import { useEffect } from 'react'
import { Platform } from 'react-native'
import * as Device from 'expo-device'
import * as Notifications from 'expo-notifications'
import Constants from 'expo-constants'
import { meApi } from '@/api/me.api'
import { useIsAuthenticated } from '@/stores/useAuthStore'

/**
 * En un emulador no hay servicios de notificación, así que Expo no puede dar
 * un identificador. Se comprueba antes para no llenar la consola de errores
 * en desarrollo.
 */
async function obtainToken(): Promise<string | null> {
  if (!Device.isDevice) return null

  const { status: existing } = await Notifications.getPermissionsAsync()
  let status = existing

  /**
   * El permiso solo se pide si aún no ha contestado. Volver a preguntar a
   * quien ya dijo que no es inútil —el sistema no lo muestra dos veces— y
   * molesto.
   */
  if (status !== 'granted') {
    const asked = await Notifications.requestPermissionsAsync()
    status = asked.status
  }

  if (status !== 'granted') return null

  /**
   * El identificador del proyecto hace falta sí o sí en una compilación
   * propia: sin él, Expo no sabe a qué app pertenece el token.
   */
  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId

  if (!projectId) return null

  const token = await Notifications.getExpoPushTokenAsync({ projectId })
  return token.data
}

export function usePushRegistration(): void {
  const isAuthenticated = useIsAuthenticated()

  useEffect(() => {
    /**
     * Al salir no se hace nada aquí: soltar el dispositivo necesita la
     * sesión, y para cuando esto se entera ya se ha ido. Lo hace `useLogout`
     * llamando a `releaseDevice` antes de limpiarla.
     */
    if (!isAuthenticated) return

    let cancelled = false

    void (async () => {
      try {
        const token = await obtainToken()
        if (!token || cancelled) return

        await meApi.registerDevice(token, Platform.OS === 'ios' ? 'IOS' : 'ANDROID')
      } catch {
        // Sin avisos se sigue pudiendo trabajar; no se molesta al usuario
      }
    })()

    return () => {
      cancelled = true
    }
  }, [isAuthenticated])
}

/**
 * Suelta este móvil antes de cerrar la sesión.
 *
 * Va aparte del hook y lo llama `useLogout`, porque tiene que ocurrir
 * mientras la sesión sigue viva: después ya no hay con qué autenticarse.
 */
export async function releaseDevice(): Promise<void> {
  try {
    if (!Device.isDevice) return

    const { status } = await Notifications.getPermissionsAsync()
    if (status !== 'granted') return

    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId

    if (!projectId) return

    const token = await Notifications.getExpoPushTokenAsync({ projectId })

    await meApi.releaseDevice(
      token.data,
      Platform.OS === 'ios' ? 'IOS' : 'ANDROID',
    )
  } catch {
    /**
     * Si falla, el usuario sale igual. El aviso perdido es un mal menor
     * frente a impedirle cerrar sesión, y el backend retira el dispositivo
     * solo en cuanto Expo lo dé por desaparecido.
     */
  }
}
