/**
 * Administración: revisión de documentos.
 *
 * Contrato: lughly-backend/src/modules/admin/admin.controller.ts
 *
 * Todo aquí exige rol `ADMIN` en el servidor. La app esconde la entrada, pero
 * el que decide es él: esconder un botón no protege un endpoint.
 */

import { apiRequest } from './http'
import type { DocumentType } from './upload.api'

export interface ApiPendingDocument {
  id: string
  type: DocumentType
  createdAt: string
  /** Su dueño: hace falta para cotejar el nombre con lo que diga el documento */
  owner: {
    id: string
    name: string
    email: string
    /** Qué dijo que aportaba: DNI, NIE o pasaporte */
    identityDocumentKind: string | null
    verified: boolean
  }
}

export interface ApiReviewResult {
  id: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  /** Si esta revisión ha dejado al usuario con la identidad verificada */
  identityVerified: boolean
}

export const adminApi = {
  /** La cola de revisión, del documento más antiguo al más nuevo */
  pendingDocuments: () =>
    apiRequest<{ items: ApiPendingDocument[] }>('/v1/admin/documents/pending', {
      auth: true,
    }),

  /**
   * Aprobar o rechazar. El motivo es obligatorio al rechazar: es lo único que
   * el usuario va a leer en su pantalla de documentos.
   */
  review: (documentId: string, approve: boolean, rejectionReason?: string) =>
    apiRequest<ApiReviewResult>(`/v1/admin/documents/${documentId}/review`, {
      method: 'POST',
      auth: true,
      body: { approve, ...(rejectionReason ? { rejectionReason } : {}) },
    }),
}
