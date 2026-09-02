/**
 * useDayRanges
 * Qué tiene libre ese día, para poder ofrecer algo cuando lo pedido no cabe.
 *
 * Solo se pregunta cuando hace falta —`enabled`—, que es cuando la lista de
 * huecos ha venido vacía. Pedirlo siempre sería una segunda consulta por cada
 * cambio de día para enseñar algo que casi nunca se ve.
 */

import { useQuery } from '@tanstack/react-query'
import { ApiError } from '@/api'
import { prosApi, type ApiDayRanges } from '@/api/pros.api'

export function dayRangesQueryKey(proId: string, day: string) {
  return ['pro', proId, 'day-ranges', day] as const
}

export function useDayRanges(
  proId: string | undefined,
  day: string,
  enabled: boolean,
) {
  return useQuery<ApiDayRanges>({
    queryKey: dayRangesQueryKey(proId ?? '', day),
    queryFn: () => prosApi.dayRanges(proId as string, day),
    enabled: Boolean(proId) && enabled,
    staleTime: 15_000,
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.status === 404) return false
      return failureCount < 2
    },
  })
}
