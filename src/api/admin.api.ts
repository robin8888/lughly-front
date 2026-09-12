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

/**
 * Un trabajo en revisión, con todo lo que hace falta para decidir sin salir de
 * la pantalla (`CICLOS` §C9).
 */
export interface ApiDisputeQueueItem {
  disputeId: string
  jobId: string
  title: string
  type: string

  clientName: string
  proName: string | null

  /** Quién la abrió. `deadline` es el reparo que nadie contestó en 72 h */
  openedBy: 'client' | 'pro' | 'deadline'
  openedAt: string
  dueAt: string
  /** Se le ha pasado el plazo: el barrido la va a devolver al cliente */
  overdue: boolean

  reason: string
  /** El reparo del cliente que la originó, con sus palabras */
  holdReason: string | null

  /** Lo que hay retenido, que es sobre lo que se decide */
  retained: number
  charges: { kind: string; amount: number }[]

  resultPhotos: { url: string; fullUrl: string }[]
  /** Lo que ha aportado cada parte, con su lado y su fecha */
  evidence: {
    id: string
    url: string
    fullUrl: string
    side: 'CLIENT' | 'PRO'
    note: string | null
    createdAt: string
  }[]
}

export const adminApi = {
  /** La cola de revisión, del documento más antiguo al más nuevo */
  pendingDocuments: () =>
    apiRequest<{ items: ApiPendingDocument[] }>('/v1/admin/documents/pending', {
      auth: true,
    }),

  /** La cola de revisiones, de la más urgente a la menos (`CICLOS` §C9) */
  disputes: () =>
    apiRequest<{ items: ApiDisputeQueueItem[] }>('/v1/admin/disputes', { auth: true }),

  /**
   * Resolver una revisión. El motivo se exige y se le manda a las dos partes:
   * una decisión sobre el dinero de alguien sin una línea que la explique no se
   * sostiene, y el reglamento P2B obliga a motivar lo que afecta al profesional.
   */
  resolveDispute: (
    disputeId: string,
    outcome: 'TO_PRO' | 'TO_CLIENT' | 'SPLIT',
    decision: string,
    toClient?: number,
  ) =>
    apiRequest<{
      disputeId: string
      jobId: string
      outcome: string
      status: string
      refunded: number
    }>(`/v1/admin/disputes/${disputeId}/resolve`, {
      method: 'POST',
      auth: true,
      body: { outcome, decision, ...(toClient !== undefined ? { toClient } : {}) },
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
