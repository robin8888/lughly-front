/**
 * useRefreshUser
 * Vuelve a leer el usuario del servidor y actualiza el store.
 *
 * Hace falta porque hay cambios que ocurren FUERA de la app: confirmar el
 * email desde el navegador, o que backoffice apruebe el documento de
 * identidad. Sin esto, la app seguiría mostrando datos de cuando se inició
 * sesión hasta que el usuario volviera a entrar.
 */

import { useCallback, useEffect } from 'react'
import { AppState } from 'react-native'
import { authApi, type ApiUser } from '@/api'
import { useAuthStore } from '@/stores/useAuthStore'

/**
 * Devuelve el usuario recién leído, o `null` si no se pudo leer.
 *
 * El valor de vuelta existe porque hay dos maneras de llamar a esto y no
 * quieren lo mismo: el refresco de fondo se traga cualquier fallo —no hay
 * nada que contar—, pero cuando lo dispara alguien pulsando un botón, callar
 * deja la pantalla igual que estaba y el botón parece roto. Quien llama
 * decide; aquí solo se informa.
 */
export function useRefreshUser() {
  const updateUser = useAuthStore((s) => s.updateUser)

  return useCallback(async (): Promise<ApiUser | null> => {
    if (!useAuthStore.getState().isAuthenticated) return null

    try {
      const user = await authApi.me()
      updateUser(user)
      return user
    } catch {
      return null
    }
  }, [updateUser])
}

/**
 * Refresca al montar y cada vez que la app vuelve a primer plano.
 *
 * Cubre justo el flujo de confirmar el email: el usuario sale a su correo,
 * pulsa el enlace y vuelve. Al volver, la app se entera.
 */
export function useRefreshUserOnForeground(): void {
  const refresh = useRefreshUser()

  useEffect(() => {
    void refresh()

    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') void refresh()
    })

    return () => subscription.remove()
  }, [refresh])
}
