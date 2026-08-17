/**
 * Trabajos publicados por el cliente.
 * Contrato: lughly-backend/src/modules/jobs/jobs.controller.ts
 */

import { apiRequest } from './http'

export type ApiJobType = 'AUCTION' | 'QUOTE' | 'INSTANT' | 'URGENT'

export type ApiJobStatus =
  | 'DRAFT'
  | 'OPEN'
  /** Encargado a alguien concreto, esperando su respuesta o la de su empresa */
  | 'PENDING_PRO'
  /** La empresa propone mandar a otro y falta que el cliente conteste */
  | 'SUBSTITUTE_PROPOSED'
  | 'AWARDED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'EXPIRED'
  | 'CANCELLED'

export interface ApiJob {
  id: string
  type: ApiJobType
  status: ApiJobStatus
  title: string
  description: string
  trade: string
  tradeLabel: string
  city: string
  maxBudget: number | null
  preferredDate: string | null
  biddingEndsAt: string | null
  photoCount: number
  /**
   * A quién eligió el cliente en el directorio, si el encargo fue directo.
   * Null en lo publicado al aire.
   */
  requestedProName: string | null
  /** Quién propone mandar la empresa en su lugar, si lo ha propuesto */
  substituteProName: string | null
  /** Hasta cuándo tiene para responder quien recibió el encargo */
  respondByAt: string | null
  /** Pujas vivas recibidas */
  bidCount: number
  /** La más baja de las vivas; null si aún no hay ninguna */
  lowestBid: number | null
  createdAt: string
}

export interface CreateJobPayload {
  /**
   * `QUOTE` no está: un presupuesto directo se pide a un profesional
   * concreto desde su ficha, no se publica al aire.
   */
  type: 'AUCTION' | 'INSTANT' | 'URGENT'
  tradeSlug: string
  title: string
  description: string
  city: string
  /**
   * Obligatorios en una urgencia y opcionales en el resto: solo se avisa a
   * quien cubre la dirección con su radio, así que sin punto no hay a quién
   * avisar. En una subasta no hace falta hasta adjudicar.
   */
  /**
   * Obligatoria. No se enseña a nadie que no esté adjudicado: no viaja en el
   * listado de subastas ni en la bandeja de encargos, solo en la agenda de
   * quien va a hacer el trabajo.
   */
  addressLine: string
  latitude?: number
  longitude?: number
  maxBudget?: number
  preferredDate?: string
  /** Obligatorio en subasta; el servidor lo exige */
  biddingEndsAt?: string
}

export interface MyJobsPage {
  items: ApiJob[]
  total: number
}

export const jobsApi = {
  create: (payload: CreateJobPayload) =>
    apiRequest<ApiJob>('/v1/jobs', { method: 'POST', auth: true, body: payload }),

  mine: () => apiRequest<MyJobsPage>('/v1/jobs', { auth: true }),
}
