/**
 * La cuenta propia: dispositivos para avisos y lectura de documentos.
 * Contrato: lughly-backend/src/modules/me/me.controller.ts
 *
 * Subir avatar y documentos vive en `upload.api.ts` y la contraseña en
 * `auth.api.ts`, por razones históricas. Leer los documentos sí está aquí.
 *
 * **Las listas van en sobre `{ items }`, no como array pelado.** Es la
 * convención de toda la API, y saltársela costó un fallo real: este endpoint
 * devolvía el array suelto, el cliente leía `data.items`, obtenía `undefined`,
 * y Mi cuenta decía "te falta el documento" a gente que los tenía aprobados.
 * Nada lo delataba, porque un `?? []` convierte el desajuste en una lista vacía
 * perfectamente plausible.
 *
 * La línea `Contrato:` de arriba estaba puesta y el fallo ocurrió igual: no
 * basta con que apunte al controlador, hay que abrirlo.
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
   * Cambia el nombre o el teléfono. Se manda solo lo que cambia.
   *
   * El correo **no** se toca aquí: es la identidad con la que se entra, y
   * cambiarlo pide comprobar antes que el nuevo es de quien dice.
   */
  updateProfile: (payload: { name?: string; phone?: string }) =>
    apiRequest<{ name: string; phone: string | null }>('/v1/me', {
      method: 'PATCH',
      auth: true,
      body: payload,
    }),

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
