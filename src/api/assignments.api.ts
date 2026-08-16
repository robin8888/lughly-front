/**
 * Encargos a un profesional concreto y su reparto.
 * Contrato: lughly-backend/src/modules/jobs/assignments.controller.ts
 *
 * El cliente elige a una persona en el directorio, pero si trabaja para
 * alguien el encargo lo recibe su empresa: es quien contrata, presupuesta y
 * factura. El trabajador se entera cuando se lo asignan.
 */

import { apiRequest } from './http'

export interface RequestProPayload {
  /** Presupuesto directo o reserva; una urgencia no pasa por aquí */
  type: 'QUOTE' | 'INSTANT'
  tradeSlug: string
  title: string
  description: string
  city: string
  preferredDate?: string
  maxBudget?: number
}

export interface ApiDirectRequest {
  id: string
  status: string
  type: string
  title: string
  trade: string
  tradeLabel: string
  /** A quién eligió el cliente */
  requestedProName: string
  /**
   * Quién va a contestar: la empresa si trabaja para alguien. Se enseña al
   * cliente para que no le extrañe recibir respuesta a nombre de otro.
   */
  respondedByName: string
  respondByAt: string
  createdAt: string
}

/** Un encargo pendiente de responder, en la bandeja de quien lo recibió. */
export interface ApiInboxItem {
  id: string
  type: string
  status: 'PENDING_PRO' | 'SUBSTITUTE_PROPOSED'
  title: string
  description: string
  trade: string
  tradeLabel: string
  city: string
  maxBudget: number | null
  preferredDate: string | null
  respondByAt: string | null
  /** A quién eligió el cliente */
  requestedProId: string
  requestedProName: string
  /** A quién se ha propuesto en su lugar, si ya se propuso */
  substituteProName: string | null
  photoCount: number
  createdAt: string
}

export interface ApiAssignment {
  jobId: string
  status: string
  /** Quién lo hará, si ya está decidido */
  assignedProName: string | null
  /** Si falta que el cliente acepte el cambio */
  awaitingClient: boolean
}

export interface ApiSubstituteDecision {
  jobId: string
  status: string
  assignedProName: string | null
}

export const assignmentsApi = {
  /** El cliente encarga a alguien concreto del directorio */
  request: (proId: string, payload: RequestProPayload) =>
    apiRequest<ApiDirectRequest>(`/v1/pros/${proId}/requests`, {
      method: 'POST',
      auth: true,
      body: payload,
    }),

  /** Lo que tengo pendiente de responder: lo mío, o lo de toda mi gente */
  inbox: () =>
    apiRequest<{ items: ApiInboxItem[] }>('/v1/pro/inbox', { auth: true }),

  /** Quién hará el trabajo. Si no es a quien pidió el cliente, él decide */
  assign: (jobId: string, proId: string) =>
    apiRequest<ApiAssignment>(`/v1/jobs/${jobId}/assign`, {
      method: 'POST',
      auth: true,
      body: { proId },
    }),

  /** La respuesta del cliente al cambio de persona */
  respondSubstitute: (jobId: string, accept: boolean) =>
    apiRequest<ApiSubstituteDecision>(`/v1/jobs/${jobId}/substitute`, {
      method: 'POST',
      auth: true,
      body: { accept },
    }),
}
