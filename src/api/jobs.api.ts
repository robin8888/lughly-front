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
  /** La empresa ya ha asignado a uno de los suyos y falta que él lo confirme */
  | 'PENDING_WORKER'
  | 'AWARDED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'EXPIRED'
  /** El profesional ha dicho que no puede. No es lo mismo que expirar */
  | 'DECLINED'
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
  /**
   * Con quién está el trabajo: quien lo hace si ya está adjudicado, y si no, a
   * quien se le encargó. Null en lo publicado al aire, que todavía no es de
   * nadie.
   */
  proName: string | null
  proAvatarUrl: string | null
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


/** Quién hace el trabajo, cuando ya está decidido. */
export interface ApiAssignedPro {
  id: string
  /** La foto de quien va a ir, aunque se contratara a la empresa */
  avatarUrl: string | null
  /** A quién se contrató: la empresa, si la hay */
  name: string
  /** Quién va a ir, si es distinto de lo anterior */
  workerName: string | null
  rating: number
  reviewCount: number
  /** Solo lo ve el cliente, y solo cuando ya hay alguien asignado */
  phone: string | null
}

/**
 * La ficha completa de un trabajo.
 * Contrato: lughly-backend/src/modules/jobs/jobs.controller.ts (GET /v1/jobs/:id)
 *
 * Lo que llega depende de quién mira, y eso lo decide el servidor: el cliente
 * ve su dirección, su tope y las pujas; quien va a hacerlo ve la dirección y
 * el teléfono del cliente pero no el dinero de los demás. `viewer` dice desde
 * qué lado se está mirando, para no tener que deducirlo comparando
 * identificadores.
 */
export interface ApiJobDetail {
  id: string
  type: ApiJobType
  status: ApiJobStatus
  title: string
  description: string
  trade: string
  tradeLabel: string
  city: string
  viewer: 'client' | 'pro'
  addressLine: string | null
  latitude: number | null
  longitude: number | null
  preferredDate: string | null
  biddingEndsAt: string | null
  /** Hasta cuándo hay para responder, si se espera a alguien */
  respondByAt: string | null
  maxBudget: number | null
  /** El precio acordado, cuando lo hay */
  amount: number | null
  assignedPro: ApiAssignedPro | null
  /** A quién propone la empresa, si se espera al cliente */
  substituteProName: string | null
  clientName: string | null
  clientPhone: string | null
  bidCount: number | null
  lowestBid: number | null
  photoCount: number
  createdAt: string
}

export const jobsApi = {
  create: (payload: CreateJobPayload) =>
    apiRequest<ApiJob>('/v1/jobs', { method: 'POST', auth: true, body: payload }),

  mine: () => apiRequest<MyJobsPage>('/v1/jobs', { auth: true }),

  /** La ficha completa de un trabajo, para quien tiene algo que ver con él */
  detail: (jobId: string) =>
    apiRequest<ApiJobDetail>(`/v1/jobs/${jobId}`, { auth: true }),
}
