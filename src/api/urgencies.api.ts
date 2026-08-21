/**
 * Urgencias: el lado del profesional.
 * Contrato: lughly-backend/src/modules/jobs/urgencies.controller.ts
 */

import { apiRequest } from './http'
import type { ApiAppointmentStatus } from './jobs.api'

export interface ApiUrgency {
  id: string
  title: string
  description: string
  tradeLabel: string
  city: string
  /** Distancia desde su base, en km */
  distanceKm: number | null
  photoCount: number
  /**
   * Lo que fotografió el cliente, para el que tiene que decidir si va.
   * `url` es la reducida, para la tira; `fullUrl` la original, para mirarla
   * de cerca.
   */
  photos: { url: string; fullUrl: string }[]
  /** Hasta cuándo tiene para contestar. Son minutos, no horas */
  respondByAt: string | null
  createdAt: string
}

/**
 * Quién puede atender una urgencia ahora mismo, para que el cliente elija.
 * Contrato: lughly-backend/src/modules/jobs/jobs.controller.ts (GET /v1/jobs/urgency-pros)
 */
export interface ApiUrgencyPro {
  id: string
  name: string
  avatarUrl: string | null
  /** Para quién trabaja: a quien se contrata es a la empresa, si la hay */
  employerName: string | null
  tradeLabel: string
  /** Lo que cobra la hora por atender esta urgencia */
  urgencyRate: number
  rating: number
  reviewCount: number
  verified: boolean
  distanceKm: number
}

export interface ApiBusyWith {
  id: string
  title: string
  /** La dirección exacta, que solo se entrega al aceptar */
  addressLine: string | null
  /** `CONFIRMED` si aún no ha pulsado Empezar, `STARTED` si ya está dentro */
  status: ApiAppointmentStatus
}

export interface UrgenciesResult {
  items: ApiUrgency[]
  /** La que está atendiendo ahora mismo, si hay alguna */
  busyWith: ApiBusyWith | null
}

export interface AcceptedUrgency {
  jobId: string
  title: string
  addressLine: string | null
  latitude: number | null
  longitude: number | null
  city: string
  acceptedAt: string
}

export interface FinishedUrgency {
  jobId: string
  status: string
  /** Vuelve a estar disponible si su interruptor seguía encendido */
  availableAgain: boolean
}

export interface StartedUrgency {
  jobId: string
  status: string
}

export const urgenciesApi = {
  mine: () => apiRequest<UrgenciesResult>('/v1/urgencies', { auth: true }),

  accept: (jobId: string) =>
    apiRequest<AcceptedUrgency>(`/v1/urgencies/${jobId}/accept`, {
      method: 'POST',
      auth: true,
    }),

  /** Marca que ha llegado y está trabajando en ella. No libera: eso es `finish` */
  start: (jobId: string) =>
    apiRequest<StartedUrgency>(`/v1/urgencies/${jobId}/start`, {
      method: 'POST',
      auth: true,
    }),

  finish: (jobId: string) =>
    apiRequest<FinishedUrgency>(`/v1/urgencies/${jobId}/finish`, {
      method: 'POST',
      auth: true,
    }),
}
