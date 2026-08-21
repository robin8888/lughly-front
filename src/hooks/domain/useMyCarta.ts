/**
 * useMyCarta
 * La carta de un oficio propio: tarifa de visita y servicios a precio fijo.
 *
 * Al guardar se invalida también "Mis oficios" y la ficha/directorio: el
 * selector de la ficha lee `visitFee`/`services` desde ahí, y si no se
 * refrescan seguirían enseñando la carta anterior hasta que caducase la
 * caché.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ApiError, NetworkError } from '@/api'
import { prosApi, type ApiCarta, type SetCartaPayload } from '@/api/pros.api'
import { myTradesQueryKey } from './useMyTrades'

export function myCartaQueryKey(tradeSlug: string) {
  return ['pro', 'carta', tradeSlug] as const
}

export function useMyCarta(tradeSlug: string, enabled = true) {
  return useQuery<ApiCarta>({
    queryKey: myCartaQueryKey(tradeSlug),
    queryFn: () => prosApi.myCarta(tradeSlug),
    enabled,
    staleTime: 60_000,
  })
}

export function useSetMyCarta(tradeSlug: string) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (payload: SetCartaPayload) => prosApi.setMyCarta(tradeSlug, payload),
    onSuccess: (carta) => {
      queryClient.setQueryData(myCartaQueryKey(tradeSlug), carta)

      // Su ficha y el directorio enseñan la carta en cuanto la tiene montada
      void queryClient.invalidateQueries({ queryKey: myTradesQueryKey() })
      void queryClient.invalidateQueries({ queryKey: ['pro'] })
      void queryClient.invalidateQueries({ queryKey: ['pros'] })
    },
  })

  const error = mutation.error

  return {
    save: async (payload: SetCartaPayload): Promise<ApiCarta | null> => {
      try {
        return await mutation.mutateAsync(payload)
      } catch {
        return null
      }
    },
    isSaving: mutation.isPending,
    formError:
      error instanceof NetworkError
        ? error.message
        : error instanceof ApiError
          ? error.message
          : null,
    reset: () => mutation.reset(),
  }
}
