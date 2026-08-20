/**
 * useUrgencyPros
 * Quién puede atender una urgencia ahora mismo.
 *
 * Es la pantalla que ve el cliente justo después de describir la avería. El
 * servidor decide quién sale —oficio, de guardia, dentro del radio, libre, con
 * precio y verificado— y aquí solo se pinta.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ApiError, NetworkError } from '@/api'
import { jobsApi } from '@/api/jobs.api'
import type { ApiUrgencyPro } from '@/api/urgencies.api'

export function useUrgencyPros(
  trade: string | undefined,
  point: { lat: number; lng: number } | null,
) {
  return useQuery<{ items: ApiUrgencyPro[] }>({
    queryKey: ['urgency-pros', trade, point?.lat, point?.lng],
    queryFn: () => jobsApi.urgencyPros(trade!, point!.lat, point!.lng),
    enabled: Boolean(trade) && point !== null,
    /**
     * Nada de caché: quién está de guardia cambia de un minuto a otro, y
     * ofrecer a alguien que acaba de coger otra urgencia es mandar al cliente
     * a un no con la casa inundada. Se refresca sola mientras se mira.
     */
    staleTime: 0,
    refetchInterval: 20_000,
  })
}

/** Pedirle la urgencia a uno concreto */
export function useAskUrgency() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: ({ jobId, proId }: { jobId: string; proId: string }) =>
      jobsApi.askUrgency(jobId, proId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['jobs'] })
    },
  })

  return {
    ask: async (jobId: string, proId: string) => {
      try {
        return {
          ok: true as const,
          result: await mutation.mutateAsync({ jobId, proId }),
          error: null,
        }
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
    isAsking: mutation.isPending,
  }
}
