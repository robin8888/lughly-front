/**
 * Geocodificación: dirección escrita → coordenadas.
 * Contrato: lughly-backend/src/modules/geocode/geocode.controller.ts
 *
 * Va por POST y no por GET a propósito: la consulta es una dirección escrita
 * por una persona, y en un GET acabaría en los logs de acceso del proxy.
 */

import { apiRequest } from './http'

export interface ApiGeocodeMatch {
  label: string
  lat: number
  lng: number
  city: string | null
  postcode: string | null
}

export interface GeocodeResult {
  matches: ApiGeocodeMatch[]
}

export const geocodeApi = {
  search: (query: string) =>
    apiRequest<GeocodeResult>('/v1/geocode', {
      method: 'POST',
      auth: true,
      body: { query },
    }),

  /**
   * Coordenadas → dirección legible, para cuando el cliente comparte su
   * ubicación en una urgencia. `match` es null si no hay nada reconocible
   * en ese punto.
   */
  reverse: (lat: number, lng: number) =>
    apiRequest<{ match: ApiGeocodeMatch | null }>('/v1/geocode/reverse', {
      method: 'POST',
      auth: true,
      body: { lat, lng },
    }),
}
