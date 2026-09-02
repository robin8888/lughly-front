/**
 * useHoursQuote
 * Cuánto costaría contratarle ese rato, antes de pagar. No reserva nada.
 *
 * La cuenta la hace entera el servidor y aquí no se rehace ni un céntimo: el
 * mínimo del oficio, los recargos de esa persona, el calendario de festivos de
 * su comunidad y la excepción que le haya puesto a ese día viven allí. Sumar
 * por nuestra cuenta acabaría enseñando un total distinto del que se cobra, y
 * es exactamente el desglose que va a cobrar `book-hours`.
 *
 * Sin hueco elegido no se pregunta: el precio depende de la hora de inicio
 * —un sábado por la noche no cuesta lo que un martes— así que no hay respuesta
 * posible hasta que hay hora.
 */

import { useQuery } from '@tanstack/react-query'
import { ApiError } from '@/api'
import { prosApi, type ApiHoursQuote } from '@/api/pros.api'

export interface HoursQuoteQuery {
  tradeSlug: string
  /** El hueco elegido, ISO */
  startAt: string
  durationMin: number
}

export function hoursQuoteQueryKey(proId: string, query: HoursQuoteQuery) {
  return ['pro', proId, 'hours-quote', query] as const
}

export function useHoursQuote(
  proId: string | undefined,
  query: HoursQuoteQuery | null,
) {
  return useQuery<ApiHoursQuote>({
    queryKey: hoursQuoteQueryKey(proId ?? '', query ?? { tradeSlug: '', startAt: '', durationMin: 0 }),
    queryFn: () => prosApi.hoursQuote(proId as string, query as HoursQuoteQuery),
    enabled: Boolean(proId) && query !== null,
    staleTime: 60_000,
    retry: (failureCount, error) => {
      /*
        Un 409 es "ese oficio suyo no se cobra por horas": no cambia por
        insistir, y el mensaje que trae es el que hay que enseñar.
      */
      if (error instanceof ApiError && [404, 409].includes(error.status)) return false
      return failureCount < 2
    },
  })
}
