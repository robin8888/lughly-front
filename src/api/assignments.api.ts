/**
 * Encargos a un profesional concreto y su reparto.
 * Contrato: lughly-backend/src/modules/jobs/assignments.controller.ts
 *
 * El cliente elige a una persona en el directorio, pero si trabaja para
 * alguien el encargo lo recibe su empresa: es quien contrata, presupuesta y
 * factura. El trabajador se entera cuando se lo asignan.
 */

import { apiRequest } from './http'
import type { ApiJobStatus, ApiJobType } from './jobs.api'

export interface RequestProPayload {
  /** Presupuesto directo o reserva; una urgencia no pasa por aquí */
  type: 'QUOTE' | 'INSTANT'
  tradeSlug: string
  title: string
  description: string
  city: string
  /**
   * Se guarda desde el principio pero solo la ve quien quede asignado: no
   * viaja en la bandeja ni la ve la empresa mientras decide a quién manda.
   */
  addressLine: string
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
  /**
   * Si quien mira puede quedarse este trabajo.
   *
   * Lo decide el servidor: al asignar exige que el elegido tenga ese oficio
   * dado de alta, y da igual que el elegido sea uno mismo. Antes no venía, así
   * que aquí se ofrecía "Yo mismo" siempre y el error llegaba tras pulsar.
   */
  canAssignToSelf: boolean
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

/**
 * Un trabajo que este profesional tiene asignado.
 *
 * Lleva dirección y teléfono: a estas alturas el trabajo es suyo y sin eso no
 * puede ir. `amount` es null para un trabajador por cuenta ajena, porque el
 * importe es de la empresa que le dio de alta.
 */
export interface ApiAssignedJob {
  id: string
  type: ApiJobType
  status: ApiJobStatus
  title: string
  description: string
  trade: string
  tradeLabel: string
  city: string
  addressLine: string | null
  latitude: number | null
  longitude: number | null
  preferredDate: string | null
  clientName: string
  clientPhone: string | null
  amount: number | null
  photoCount: number
  awardedAt: string | null
  createdAt: string
}

export const assignmentsApi = {
  /** Su agenda: lo que tiene adjudicado y por delante */
  assignments: () =>
    apiRequest<{ items: ApiAssignedJob[] }>('/v1/pro/assignments', { auth: true }),

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
