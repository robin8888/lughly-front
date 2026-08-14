/**
 * Trabajos publicados por el cliente.
 * Contrato: lughly-backend/src/modules/jobs/jobs.controller.ts
 */

import { apiRequest } from './http'

export type ApiJobType = 'AUCTION' | 'QUOTE' | 'INSTANT' | 'URGENT'

export type ApiJobStatus =
  | 'DRAFT'
  | 'OPEN'
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
  createdAt: string
}

export interface CreateJobPayload {
  type: 'AUCTION' | 'INSTANT'
  tradeSlug: string
  title: string
  description: string
  city: string
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
