/**
 * La cuenta propia: dispositivos para avisos.
 * Contrato: lughly-backend/src/modules/me/me.controller.ts
 *
 * El resto de operaciones sobre la cuenta —avatar, documentos, contraseña—
 * viven en `auth.api.ts` y `upload.api.ts` por razones históricas; esto es
 * solo lo de los avisos.
 */

import { apiRequest } from './http'
import type { DocumentType } from './upload.api'

export type DevicePlatform = 'IOS' | 'ANDROID'

/** Un documento aportado, tal y como lo devuelve `GET /v1/me/documents`. */
export interface ApiDocument {
  id: string
  type: DocumentType
  /**
   * `PENDING` mientras nadie lo ha revisado, que hoy es siempre: todavía no
   * hay panel de backoffice. Se enseña igual porque el día que empiece a
   * cambiar, la pantalla ya lo cuenta sin tocar nada.
   */
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  rejectionReason: string | null
  createdAt: string
}

export const meApi = {
  /**
   * Los documentos vigentes de la cuenta.
   *
   * El endpoint existía desde agosto y no lo llamaba nadie: los documentos se
   * subían en el alta y ahí se perdía su rastro. Sin esto no hay forma de
   * saber si falta alguno, que es de lo que dependen las puertas de pujar y
   * contratar.
   */
  documents: () => apiRequest<{ items: ApiDocument[] }>('/v1/me/documents', { auth: true }),

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
