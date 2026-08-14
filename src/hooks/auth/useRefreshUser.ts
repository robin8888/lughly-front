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
import { authApi } from '@/api'
import { useAuthStore } from '@/stores/useAuthStore'

export function useRefreshUser() {
  const updateUser = useAuthStore((s) => s.updateUser)

  return useCallback(async (): Promise<void> => {
    if (!useAuthStore.getState().isAuthenticated) return

    try {
      const user = await authApi.me()
      updateUser(user)
    } catch {
      // Silencio deliberado: es una actualización de fondo. Si falla la red
      // no hay nada que contarle al usuario, se reintentará al volver.
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
