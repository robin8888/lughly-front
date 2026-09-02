/**
 * useFreeSlots
 * Cuándo puede este profesional, para que el cliente elija hueco.
 *
 * Es el paso que separa contratar por horas de rellenar un formulario: no se
 * pide "el jueves por la mañana" y se espera, se elige **un rato concreto que
 * está libre** y se paga. Sale de su horario menos sus ausencias menos lo que
 * ya tiene, con la antelación mínima aplicada.
 *
 * `staleTime` corto a propósito. La agenda es de otro: entre abrir la lista y
 * decidirse, el hueco puede irse. Guardarla media hora enseñaría ratos que ya
 * no existen, y el "no" llegaría al pagar en vez de al mirar.
 */

import { useQuery } from '@tanstack/react-query'
import { ApiError } from '@/api'
import { prosApi, type ApiFreeSlots } from '@/api/pros.api'

export interface FreeSlotsQuery {
  durationMin: number
  /** Desde cuándo mirar, ISO. Sin esto, desde ahora. */
  from?: string
  limit?: number
}

export function freeSlotsQueryKey(proId: string, query: FreeSlotsQuery) {
  return ['pro', proId, 'slots', query] as const
}

export function useFreeSlots(proId: string | undefined, query: FreeSlotsQuery) {
  return useQuery<ApiFreeSlots>({
    queryKey: freeSlotsQueryKey(proId ?? '', query),
    queryFn: () => prosApi.slots(proId as string, query),
    enabled: Boolean(proId),
    staleTime: 15_000,
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.status === 404) return false
      return failureCount < 2
    },
  })
}
