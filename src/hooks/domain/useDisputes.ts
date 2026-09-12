/**
 * useDisputes
 * La cola de revisiones y su resolución, para administración (`CICLOS` §C9).
 *
 * La cola llega **por fecha de vencimiento** y no por orden de llegada: lo que
 * importa no es cuál se abrió antes, es a cuál se le acaba el tiempo primero.
 * Una que vence sin resolver devuelve el dinero al cliente sin que nadie haya
 * mirado el caso, y eso es un fallo nuestro, no suyo.
 *
 * Al resolver se invalidan también los trabajos: quien resuelve puede ser parte
 * de otra pantalla abierta, y sobre todo el estado del trabajo cambia —se cierra
 * o se da por bueno— y la ficha tiene que dejar de decir «en revisión».
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/api/admin.api'
import { mensajeDe } from './useJob'

export const disputesQueryKey = ['admin', 'disputes'] as const

export function useDisputes(enabled = true) {
  const query = useQuery({
    queryKey: disputesQueryKey,
    queryFn: () => adminApi.disputes(),
    enabled,
    /*
      Corta: son decisiones con plazo y puede haber dos personas mirando la
      misma cola. Ver una resuelta por otro es mejor que resolverla dos veces.
    */
    staleTime: 30_000,
  })

  return {
    disputes: query.data?.items ?? [],
    isPending: query.isPending,
    isError: query.isError,
    refetch: query.refetch,
  }
}

export function useResolveDispute() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: ({
      disputeId,
      outcome,
      decision,
      toClient,
    }: {
      disputeId: string
      outcome: 'TO_PRO' | 'TO_CLIENT' | 'SPLIT'
      decision: string
      toClient?: number
    }) => adminApi.resolveDispute(disputeId, outcome, decision, toClient),

    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: disputesQueryKey })
      void queryClient.invalidateQueries({ queryKey: ['jobs'] })
    },
  })

  return {
    resolve: async (input: {
      disputeId: string
      outcome: 'TO_PRO' | 'TO_CLIENT' | 'SPLIT'
      decision: string
      toClient?: number
    }) => {
      try {
        return { ok: true as const, error: null, result: await mutation.mutateAsync(input) }
      } catch (error) {
        return { ok: false as const, result: null, error: mensajeDe(error) }
      }
    },
    isResolving: mutation.isPending,
  }
}
