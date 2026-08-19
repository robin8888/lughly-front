/**
 * Directorio de profesionales (GET /v1/pros).
 * Contrato: lughly-backend/src/modules/pros/pros.controller.ts
 */

import { apiRequest } from './http'

/** Un oficio del profesional, con lo que cobra por él. */
export interface ApiProTrade {
  slug: string
  label: string
  hourlyRate: number
}

export interface ApiPro {
  id: string
  name: string
  avatarUrl: string | null
  trade: string
  tradeLabel: string
  city: string
  /**
   * El precio del oficio al que responde esta tarjeta —el buscado si se
   * filtró, y si no el principal—, no una media de todos los suyos.
   */
  hourlyRate: number
  /** Todos los que ejerce, en su orden, para las etiquetas de la tarjeta */
  trades: ApiProTrade[]
  /**
   * Fotos de trabajos hechos, hasta cinco. En oficios dicen más que cualquier
   * descripción, así que van en la tarjeta y no solo en la ficha.
   *
   * Son las **del oficio del que habla la tarjeta**, que las elige el
   * servidor: quien ejerce dos no enseña fotos de muebles en limpieza.
   */
  photos: string[]
  rating: number
  reviewCount: number
  completedJobs: number
  availableNow: boolean
  /** Identidad verificada por backoffice */
  verified: boolean
  bio: string | null
  /** Kilómetros desde el punto enviado; null si no se envió ubicación */
  distanceKm: number | null
  /**
   * Punto base para el mapa del directorio. Es la base de trabajo que el
   * profesional declara, no su domicilio.
   */
  latitude: number | null
  longitude: number | null
  /**
   * Para quién trabaja. Encabeza la tarjeta: es a quien se contrata, quien
   * pone el precio y quien factura. Null si trabaja por su cuenta.
   */
  employerName: string | null
}

/**
 * Ficha completa (GET /v1/pros/:id).
 *
 * Superconjunto de `ApiPro` salvo `distanceKm`, que solo tiene sentido en el
 * listado: depende del punto desde el que se busca, no del profesional.
 */
/** Una foto propia, tal y como llega para gestionarla. */
export interface ApiMyProPhoto extends ApiProPhoto {
  id: string
  position: number
}

/** Una foto de la ficha, con el oficio del que es. */
export interface ApiProPhoto {
  url: string
  tradeSlug: string
  tradeLabel: string
}

export interface ApiProDetail extends Omit<ApiPro, 'distanceKm' | 'photos'> {
  /**
   * Todas sus fotos, cada una con su oficio y en el orden de sus oficios: la
   * ficha las agrupa, al contrario que la tarjeta, que solo enseña las del
   * oficio buscado. Aquí interesa ver todo lo que hace.
   */
  photos: ApiProPhoto[]
  /** Habilitación profesional comprobada (obligatoria en oficios regulados) */
  licenseVerified: boolean
  /** Kilómetros que se desplaza desde su base */
  radiusKm: number
  latitude: number | null
  longitude: number | null
  /** Alta en la plataforma, en ISO */
  memberSince: string
  /**
   * Su horario ordinario de trabajo, ordenado por día.
   *
   * Vacío significa que **no lo ha puesto**, no que no trabaje nunca: enseñar
   * "cerrado" siete veces a quien simplemente no lo ha rellenado le costaría
   * trabajos. La ficha esconde la sección entera en ese caso.
   */
  availability: ApiAvailabilityWindow[]
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

/** Respuesta de GET /v1/pros/coverage */
export interface ApiCoverage {
  /** Cuántos profesionales recibirían el aviso ahora mismo */
  available: number
  /** Del oficio y dentro del radio, pero no disponibles en este momento */
  offline: number
  /** Distancia al más cercano de los disponibles, en km */
  nearestKm: number | null
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

/** Respuesta de PUT /v1/pro/trades */
export interface SetTradesPayload {
  trades: { slug: string; hourlyRate: number }[]
}

/**
 * Una franja del horario ordinario de trabajo.
 *
 * No lleva precio, y esa es la diferencia con `ApiUrgencyWindow`: lo que cobra
 * por su trabajo normal está en sus oficios, y una franja de urgencia sí lleva
 * el suyo porque es un precio distinto para esa hora concreta.
 *
 * Las horas son locales españolas, "HH:MM". "De nueve a seis" son las nueve
 * del reloj de la pared, en verano y en invierno.
 */
export interface ApiAvailabilityWindow {
  /** 0 domingo … 6 sábado, como `Date.getDay()` */
  weekday: number
  from: string
  to: string
}

/**
 * Dónde trabaja el profesional. `latitude` y `longitude` en null significan que
 * todavía no ha fijado su base: sin ella su ficha no enseña mapa, y las
 * urgencias no se le filtran por distancia.
 */
export interface ApiCoverageSettings {
  latitude: number | null
  longitude: number | null
  radiusKm: number
  city: string
}

/** En qué estado está cada cosa que se le pide a un profesional. */
export type ApiChecklistState = 'MISSING' | 'PENDING' | 'DONE'

export interface ApiProfileChecklist {
  trades: ApiChecklistState
  photos: ApiChecklistState
  schedule: ApiChecklistState
  coverage: ApiChecklistState
  /** `PENDING` = subidos y esperando a que alguien los revise */
  identityDocuments: ApiChecklistState
}

export const prosApi = {
  list: (filters: ProsFilters = {}) =>
    apiRequest<ProsPage>(`/v1/pros${toQueryString(filters)}`),

  get: (id: string) => apiRequest<ApiProDetail>(`/v1/pros/${id}`),

  reviews: (id: string, filters: ProReviewsFilters = {}) =>
    apiRequest<ProReviewsPage>(`/v1/pros/${id}/reviews${toQueryString(filters)}`),

  /**
   * A cuántos llegaría una urgencia en ese punto. Devuelve números, no la
   * lista: quién está disponible y dónde no es asunto de quien aún no ha
   * contratado.
   */
  coverage: (trade: string, lat: number, lng: number) =>
    apiRequest<ApiCoverage>(
      `/v1/pros/coverage?trade=${encodeURIComponent(trade)}&lat=${lat}&lng=${lng}`,
      { auth: true },
    ),

  /** Mis fotos de trabajo, para gestionarlas. Vienen agrupables por oficio. */
  myPhotos: () => apiRequest<ApiMyProPhoto[]>('/v1/pro/photos', { auth: true }),

  /** Quita una. Las que quedan se recolocan en el servidor. */
  removePhoto: (id: string) =>
    apiRequest<null>(`/v1/pro/photos/${id}`, { method: 'DELETE', auth: true }),

  /** Los oficios propios, para editarlos */
  myTrades: () => apiRequest<ApiProTrade[]>('/v1/pro/trades', { auth: true }),

  /**
   * Guarda la lista completa. No hay "añadir" ni "quitar" sueltos: entre dos
   * peticiones podría quedarse sin ningún oficio, y sin oficio se desaparece
   * del directorio.
   */
  setMyTrades: (payload: SetTradesPayload) =>
    apiRequest<ApiProTrade[]>('/v1/pro/trades', {
      method: 'PUT',
      auth: true,
      body: payload,
    }),

  /**
   * Qué tiene puesto en su perfil y qué le falta. Una sola petición para las
   * cinco cosas, porque se enseñan juntas en Mi cuenta.
   */
  myChecklist: () =>
    apiRequest<ApiProfileChecklist>('/v1/pro/checklist', { auth: true }),

  /** Su zona de cobertura, para editarla */
  myCoverage: () =>
    apiRequest<ApiCoverageSettings>('/v1/pro/coverage', { auth: true }),

  /**
   * Guarda el punto base y el radio. La ciudad viaja solo si se ha elegido una
   * dirección del buscador: es por donde se busca en el directorio, y quien
   * mueve su base a otra ciudad tiene que aparecer en esa.
   */
  setMyCoverage: (payload: {
    latitude: number
    longitude: number
    radiusKm: number
    city?: string
  }) =>
    apiRequest<ApiCoverageSettings>('/v1/pro/coverage', {
      method: 'PUT',
      auth: true,
      body: payload,
    }),

  /** El horario ordinario de trabajo propio, para editarlo */
  myAvailability: () =>
    apiRequest<ApiAvailabilityWindow[]>('/v1/pro/availability', { auth: true }),

  /**
   * Guarda la semana entera, como los oficios y por lo mismo: entre dos
   * peticiones el horario quedaría a medias, y de un horario a medias salen
   * citas a horas a las que nadie piensa ir.
   *
   * Lo que devuelve puede no ser lo que se mandó: el servidor junta las
   * franjas del mismo día que se tocan y parte en dos las que cruzan la
   * medianoche. Por eso se pinta la respuesta y no lo enviado.
   */
  setMyAvailability: (windows: ApiAvailabilityWindow[]) =>
    apiRequest<ApiAvailabilityWindow[]>('/v1/pro/availability', {
      method: 'PUT',
      auth: true,
      body: { windows },
    }),

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
