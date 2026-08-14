/**
 * Directorio de profesionales (GET /v1/pros).
 * Contrato: lughly-backend/src/modules/pros/pros.controller.ts
 */

import { apiRequest } from './http'

export interface ApiPro {
  id: string
  name: string
  avatarUrl: string | null
  trade: string
  tradeLabel: string
  city: string
  hourlyRate: number
  rating: number
  reviewCount: number
  completedJobs: number
  availableNow: boolean
  /** Identidad verificada por backoffice */
  verified: boolean
  bio: string | null
  /** Kilómetros desde el punto enviado; null si no se envió ubicación */
  distanceKm: number | null
}

/**
 * Ficha completa (GET /v1/pros/:id).
 *
 * Superconjunto de `ApiPro` salvo `distanceKm`, que solo tiene sentido en el
 * listado: depende del punto desde el que se busca, no del profesional.
 */
export interface ApiProDetail extends Omit<ApiPro, 'distanceKm'> {
  /** Habilitación profesional comprobada (obligatoria en oficios regulados) */
  licenseVerified: boolean
  /** Kilómetros que se desplaza desde su base */
  radiusKm: number
  latitude: number | null
  longitude: number | null
  /** Alta en la plataforma, en ISO */
  memberSince: string
}

export interface ProsPage {
  items: ApiPro[]
  total: number
}

/**
 * Los ocho criterios de una valoración, de 1 a 5.
 * Las claves coinciden con las columnas del backend y con `REVIEW_CRITERIA`.
 */
export interface ApiReviewCriteria {
  speed: number
  knowledge: number
  performance: number
  finish: number
  cleanliness: number
  punctuality: number
  treatment: number
  budgetFit: number
}

export interface ApiReview {
  id: string
  /** Firma congelada al valorar ("Miguel A."); sobrevive a la baja del autor */
  authorLabel: string
  /** Media de los ocho criterios */
  average: number
  criteria: ApiReviewCriteria
  comment: string | null
  recommends: boolean
  /** Respuesta pública del profesional */
  proResponse: string | null
  createdAt: string
}

export interface ProReviewsPage {
  items: ApiReview[]
  total: number
  /** Media por criterio sobre TODAS sus reseñas, no solo las de esta página */
  criteriaAverages: ApiReviewCriteria | null
  /** Porcentaje de clientes que lo recomiendan (0-100); null si no hay reseñas */
  recommendRate: number | null
}

export interface ProReviewsFilters {
  limit?: number
  offset?: number
}

/** Respuesta de PATCH /v1/pro/available-now */
export interface AvailabilityState {
  availableNow: boolean
  /** Radio en km dentro del que le llegan las urgencias */
  radiusKm: number
  city: string
}

export interface ProsFilters {
  trade?: string
  availableNow?: boolean
  minRating?: number
  lat?: number
  lng?: number
  city?: string
  limit?: number
  offset?: number
}

function toQueryString(filters: ProsFilters | ProReviewsFilters): string {
  const params = new URLSearchParams()

  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value))
    }
  }

  const query = params.toString()
  return query ? `?${query}` : ''
}

export const prosApi = {
  list: (filters: ProsFilters = {}) =>
    apiRequest<ProsPage>(`/v1/pros${toQueryString(filters)}`),

  get: (id: string) => apiRequest<ApiProDetail>(`/v1/pros/${id}`),

  reviews: (id: string, filters: ProReviewsFilters = {}) =>
    apiRequest<ProReviewsPage>(`/v1/pros/${id}/reviews${toQueryString(filters)}`),

  /**
   * Activa o desactiva "disponible ahora" en el perfil propio.
   * Se manda el estado deseado, no un "alterna": dos toques con mala
   * cobertura dejarían el interruptor donde no toca.
   */
  setAvailableNow: (availableNow: boolean) =>
    apiRequest<AvailabilityState>('/v1/pro/available-now', {
      method: 'PATCH',
      auth: true,
      body: { availableNow },
    }),
}
