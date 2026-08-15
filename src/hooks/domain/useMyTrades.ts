/**
 * useMyTrades
 * Los oficios propios y sus tarifas.
 *
 * Al guardar se invalida también la ficha del profesional: el directorio y
 * su propio inicio enseñan el oficio principal y su precio, y si no se
 * refrescan seguirían mostrando el anterior hasta que caducase la caché.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ApiError, NetworkError } from '@/api'
import { prosApi, type ApiProTrade, type SetTradesPayload } from '@/api/pros.api'

export function myTradesQueryKey() {
  return ['pro', 'trades'] as const
}

export function useMyTrades(enabled = true) {
  return useQuery<ApiProTrade[]>({
    queryKey: myTradesQueryKey(),
    queryFn: () => prosApi.myTrades(),
    enabled,
    staleTime: 60_000,
  })
}

export function useSetMyTrades() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (payload: SetTradesPayload) => prosApi.setMyTrades(payload),
    onSuccess: (trades) => {
      queryClient.setQueryData(myTradesQueryKey(), trades)

      // Su ficha y el directorio enseñan el principal con su precio
      void queryClient.invalidateQueries({ queryKey: ['pro'] })
      void queryClient.invalidateQueries({ queryKey: ['pros'] })
    },
  })

  const error = mutation.error

  return {
    save: async (payload: SetTradesPayload): Promise<ApiProTrade[] | null> => {
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
