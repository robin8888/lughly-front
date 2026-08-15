/**
 * useMyUrgencies
 * Las urgencias que le corresponden a este profesional.
 *
 * **Se refresca cada 20 segundos.** Es la única pantalla del proyecto que lo
 * hace, y con motivo: una urgencia dura minutos y el README da 30 para
 * aceptarla. Un listado que solo se actualiza al entrar haría llegar tarde a
 * todas.
 *
 * No es una notificación push —eso es de la Fase 11— pero mientras la
 * pantalla está abierta, funciona.
 */

import { useQuery } from '@tanstack/react-query'
import { urgenciesApi, type UrgenciesResult } from '@/api/urgencies.api'

export function myUrgenciesQueryKey() {
  return ['urgencies', 'mine'] as const
}

export function useMyUrgencies(enabled = true) {
  return useQuery<UrgenciesResult>({
    queryKey: myUrgenciesQueryKey(),
    queryFn: () => urgenciesApi.mine(),
    enabled,
    staleTime: 0,
    refetchInterval: 20_000,
  })
}
