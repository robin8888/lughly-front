/**
 * Oficios (GET /v1/trades).
 *
 * `src/utils/trades.ts` sigue siendo la fuente para las ilustraciones y como
 * respaldo sin conexión; esta llamada trae las etiquetas vivas del backend.
 */

import { apiRequest } from './http'

export interface ApiTrade {
  slug: string
  label: string
  regulated: boolean
}

export const tradesApi = {
  list: () => apiRequest<ApiTrade[]>('/v1/trades'),
}
