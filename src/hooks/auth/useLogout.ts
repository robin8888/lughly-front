/**
 * useLogout
 * Cierra la sesión de este dispositivo (POST /v1/auth/logout).
 *
 * El estado local se limpia SIEMPRE, aunque la llamada al backend falle:
 * si no hay red, el usuario debe poder salir igualmente. El backend recibe
 * el aviso cuando pueda; mientras, el refresh token caduca solo.
 */

import { useCallback, useState } from 'react'
import { authApi } from '@/api'
import { releaseDevice } from '@/hooks/push/usePushRegistration'
import { useAuthStore } from '@/stores/useAuthStore'
import { useRoleStore } from '@/stores/useRoleStore'

export function useLogout() {
  const [isLoading, setIsLoading] = useState(false)

  const logout = useCallback(async (): Promise<void> => {
    setIsLoading(true)

    const { refreshToken, clearAuth } = useAuthStore.getState()

    try {
      /**
       * Primero se suelta el móvil, mientras la sesión sigue viva: después
       * no habría con qué autenticarse. Sin esto, quien use este teléfono
       * después seguiría recibiendo los avisos de esta cuenta.
       */
      await releaseDevice()

      if (refreshToken) {
        await authApi.logout(refreshToken)
      }
    } catch {
      // Intencionado: cerrar sesión nunca debe fallar de cara al usuario
    } finally {
      clearAuth()
      // El modo activo se persiste en el dispositivo: si no se limpia, el
      // siguiente que inicie sesión hereda el del anterior.
      useRoleStore.getState().setActiveRole('client')
      setIsLoading(false)
    }
  }, [])

  return { logout, isLoading }
}
