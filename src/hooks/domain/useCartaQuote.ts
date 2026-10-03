/**
 * useCartaQuote
 * Cuánto costaría contratar la carta —la visita sola, o la suma de los
 * servicios marcados—, con la tarifa de servicio ya sumada. No reserva nada.
 *
 * La cuenta la hace el servidor y aquí no se rehace: la tarifa de servicio
 * tiene un mínimo y un tope **por cobro**, no por línea, así que sumar la de
 * cada servicio por separado cobraría de más en cuanto se marque más de uno.
 * Es exactamente el desglose que va a cobrar `book-services`.
 */

import { useQuery } from '@tanstack/react-query'
import { ApiError } from '@/api'
import { prosApi, type ApiCartaQuote } from '@/api/pros.api'

export interface CartaQuoteQuery {
  tradeSlug: string
  serviceIds: string[]
}

export function cartaQuoteQueryKey(proId: string, query: CartaQuoteQuery) {
  return ['pro', proId, 'carta-quote', query] as const
}

export function useCartaQuote(proId: string | undefined, query: CartaQuoteQuery | null) {
  return useQuery<ApiCartaQuote>({
    queryKey: cartaQuoteQueryKey(proId ?? '', query ?? { tradeSlug: '', serviceIds: [] }),
    queryFn: () => prosApi.cartaQuote(proId as string, query as CartaQuoteQuery),
    enabled: Boolean(proId) && query !== null,
    staleTime: 60_000,
    retry: (failureCount, error) => {
      /* Un 404 es "ese oficio no tiene carta" o "ese servicio ya no es suyo": no cambia por insistir */
      if (error instanceof ApiError && error.status === 404) return false
      return failureCount < 2
    },
  })
}
