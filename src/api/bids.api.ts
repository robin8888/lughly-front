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

export const bidsApi = {
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
