/**
 * La cuenta propia: dispositivos para avisos, lectura de documentos y
 * favoritos.
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
import type { ApiGeocodeMatch } from './geocode.api'
import type { DocumentType } from './upload.api'
import type { ProsPage } from './pros.api'

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
  updateProfile: (payload: {
    name?: string
    phone?: string
    /**
     * Elegida del autocompletado, igual que en el alta: el servidor la rechaza
     * sin coordenadas. **No se puede vaciar** —a diferencia del teléfono—,
     * porque es obligatoria para crear la cuenta.
     *
     * Cambiarla no mueve la zona de cobertura de un profesional: dónde vive y
     * desde dónde sale a trabajar son dos cosas, y la segunda tiene su propia
     * pantalla.
     */
    address?: ApiGeocodeMatch
  }) =>
    apiRequest<{
      name: string
      phone: string | null
      address: ApiGeocodeMatch | null
    }>('/v1/me', {
      method: 'PATCH',
      auth: true,
      body: payload,
    }),

  /**
   * Los documentos vigentes de la cuenta.
   *
   * El endpoint existía desde agosto y no lo llamaba nadie: los documentos se
   * subían en el alta y ahí se perdía su rastro. Sin esto no hay forma de
   * saber si falta alguno, que es de lo que depende poder contratar y que te
   * contraten.
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

  /**
   * Los profesionales marcados como favoritos (COMO_SE_CONTRATA.md §11), en
   * la misma forma que `prosApi.list`: la tarjeta de directorio de siempre.
   */
  favorites: () => apiRequest<ProsPage>('/v1/me/favorites', { auth: true }),

  /** Marca a un profesional como favorito. Marcar dos veces no da error. */
  addFavorite: (proId: string) =>
    apiRequest<null>(`/v1/me/favorites/${proId}`, { method: 'POST', auth: true }),

  /** Lo quita de favoritos. Quitar a quien no estaba tampoco da error. */
  removeFavorite: (proId: string) =>
    apiRequest<null>(`/v1/me/favorites/${proId}`, { method: 'DELETE', auth: true }),
}
