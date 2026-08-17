/**
 * Pujas: el lado del profesional.
 * Contrato: lughly-backend/src/modules/bids/bids.controller.ts
 */

import { apiRequest } from './http'

export interface ApiMyBid {
  amount: number
  estimatedDays: number
}

export interface ApiOpenJob {
  id: string
  title: string
  description: string
  trade: string
  tradeLabel: string
  city: string
  maxBudget: number | null
  biddingEndsAt: string | null
  photoCount: number
  createdAt: string
  /** Cuántos han pujado ya */
  bidCount: number
  /** La más baja de las vivas. No se dice de quién es. */
  lowestBid: number | null
  /** Lo que ofreciste tú, si ya pujaste */
  myBid: ApiMyBid | null
}

export interface OpenJobsPage {
  items: ApiOpenJob[]
  total: number
}

export interface ApiBid {
  id: string
  amount: number
  estimatedDays: number
  conditions: string | null
  status: 'ACTIVE' | 'WITHDRAWN' | 'ACCEPTED' | 'REJECTED'
  createdAt: string
  updatedAt: string
}

export interface PlaceBidPayload {
  amount: number
  estimatedDays: number
  conditions?: string
}

export interface OpenJobsFilters {
  trade?: string
  city?: string
}

/**
 * Una puja recibida, tal como la ve el cliente.
 *
 * Lleva la reputación al lado del precio a propósito: el README manda comparar
 * precio, plazo y reputación. Con solo el precio, la subasta la gana siempre
 * el más barato, que es lo que hunde un directorio de oficios.
 */
export interface ApiJobBid {
  id: string
  amount: number
  estimatedDays: number
  conditions: string | null
  proId: string
  /** La razón social si tiene gente a cargo: es a quien se contrata */
  proName: string
  avatarUrl: string | null
  /** Cuántas personas tiene a su cargo; 0 si trabaja solo */
  staffCount: number
  rating: number
  reviewCount: number
  completedJobs: number
  verified: boolean
  createdAt: string
}

export interface ApiAwardResult {
  jobId: string
  status: string
  awardedToName: string
  amount: number
  /** Si falta que la empresa diga a cuál de los suyos manda */
  awaitingWorker: boolean
}

export const bidsApi = {
  /** Las pujas que ha recibido un trabajo mío */
  jobBids: (jobId: string) =>
    apiRequest<{ items: ApiJobBid[] }>(`/v1/jobs/${jobId}/bids`, { auth: true }),

  /**
   * Cierra la subasta con esa puja. Se manda la puja y no el profesional:
   * es lo que el cliente ha elegido de verdad, con su importe y su plazo.
   */
  award: (jobId: string, bidId: string) =>
    apiRequest<ApiAwardResult>(`/v1/jobs/${jobId}/award`, {
      method: 'POST',
      auth: true,
      body: { bidId },
    }),

  open: (filters: OpenJobsFilters = {}) => {
    const params = new URLSearchParams()
    if (filters.trade) params.set('trade', filters.trade)
    if (filters.city) params.set('city', filters.city)
    const query = params.toString()

    return apiRequest<OpenJobsPage>(`/v1/jobs/open${query ? `?${query}` : ''}`, {
      auth: true,
    })
  },

  /** Pujar. Si ya habías pujado, esto corrige tu oferta. */
  place: (jobId: string, payload: PlaceBidPayload) =>
    apiRequest<ApiBid>(`/v1/jobs/${jobId}/bids`, {
      method: 'POST',
      auth: true,
      body: payload,
    }),
}
