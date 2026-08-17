/**
 * useJobBids / useAwardBid
 * Las pujas de un trabajo del cliente, y la adjudicación.
 *
 * Al adjudicar se invalida todo lo que cambia de golpe: la lista de trabajos
 * del cliente, las pujas de ese trabajo y las subastas abiertas —para el
 * profesional que ha perdido, esa ya no está—.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ApiError, NetworkError } from '@/api'
import { bidsApi, type ApiJobBid } from '@/api/bids.api'

export function jobBidsQueryKey(jobId: string) {
  return ['jobs', jobId, 'bids'] as const
}

export function useJobBids(jobId: string | undefined) {
  return useQuery<{ items: ApiJobBid[] }>({
    queryKey: jobBidsQueryKey(jobId ?? ''),
    queryFn: () => bidsApi.jobBids(jobId as string),
    enabled: Boolean(jobId),
    /**
     * Corto: en una subasta viva entran pujas mientras se mira, y decidir
     * sobre una lista de hace cinco minutos es decidir a ciegas.
     */
    staleTime: 10_000,
  })
}

export function useAwardBid(jobId: string | undefined) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (bidId: string) => bidsApi.award(jobId as string, bidId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['jobs'] })
      void queryClient.invalidateQueries({ queryKey: ['pro', 'inbox'] })
    },
  })

  return {
    /**
     * El motivo viaja con la respuesta y no en el estado del hook: quien lo
     * llama está en el `onPress` de un diálogo, cuyo cierre ya capturó el
     * estado anterior y leería el error de la vez pasada.
     */
    award: async (bidId: string) => {
      try {
        return { ok: true as const, result: await mutation.mutateAsync(bidId), error: null }
      } catch (error) {
        return {
          ok: false as const,
          result: null,
          error:
            error instanceof NetworkError || error instanceof ApiError
              ? error.message
              : null,
        }
      }
    },
    isAwarding: mutation.isPending,
  }
}
