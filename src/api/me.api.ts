/**
 * La cuenta propia: dispositivos para avisos.
 * Contrato: lughly-backend/src/modules/me/me.controller.ts
 *
 * El resto de operaciones sobre la cuenta —avatar, documentos, contraseña—
 * viven en `auth.api.ts` y `upload.api.ts` por razones históricas; esto es
 * solo lo de los avisos.
 */

import { apiRequest } from './http'

export type DevicePlatform = 'IOS' | 'ANDROID'

export const meApi = {
  /**
   * Este móvil pasa a recibir avisos de la cuenta con la que se llama. Si el
   * aparato estaba a nombre de otra, el backend lo reasigna: un teléfono
   * cambia de manos y el dueño nuevo no debe recibir lo del anterior.
   */
  registerDevice: (token: string, platform: DevicePlatform) =>
    apiRequest<null>('/v1/me/devices', {
      method: 'POST',
      auth: true,
      body: { token, platform },
    }),

  /** Deja de recibir avisos aquí. Se llama al cerrar sesión. */
  releaseDevice: (token: string, platform: DevicePlatform) =>
    apiRequest<null>('/v1/me/devices', {
      method: 'DELETE',
      auth: true,
      body: { token, platform },
    }),
}
