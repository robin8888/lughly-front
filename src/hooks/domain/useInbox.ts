/**
 * useInbox
 * Los encargos pendientes de responder.
 *
 * `refetchInterval`: cada encargo tiene un plazo de 24 horas y la lista es
 * hoy el único aviso que hay. Un minuto es suficiente para que nadie pierda
 * un encargo por tener la pantalla abierta, y no es un coste apreciable.
 * Cuando existan los avisos al móvil, esto se puede espaciar.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ApiError, NetworkError } from '@/api'
import {
  assignmentsApi,
  type ApiAssignedJob,
  type ApiInboxItem,
} from '@/api/assignments.api'

export function inboxQueryKey() {
  return ['pro', 'inbox'] as const
}

export function useInbox(enabled = true) {
  return useQuery<{ items: ApiInboxItem[] }>({
    queryKey: inboxQueryKey(),
    queryFn: () => assignmentsApi.inbox(),
    enabled,
    staleTime: 30_000,
    refetchInterval: 60_000,
  })
}

/**
 * La agenda del profesional: lo que tiene asignado.
 *
 * `staleTime` corto porque en el día del trabajo importa: si el cliente
 * cambia algo o le asignan otro encargo, se ve al volver a la pestaña.
 */
export function useAssignedJobs(enabled = true) {
  return useQuery<{ items: ApiAssignedJob[] }>({
    queryKey: ['pro', 'assignments'],
    queryFn: () => assignmentsApi.assignments(),
    enabled,
    staleTime: 30_000,
  })
}

export function useAssignJob() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: ({ jobId, proId }: { jobId: string; proId: string }) =>
      assignmentsApi.assign(jobId, proId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: inboxQueryKey() })
      // Al asignar, el trabajo aparece en la agenda de quien va a hacerlo
      void queryClient.invalidateQueries({ queryKey: ['jobs'] })
    },
  })

  return {
    /**
     * Devuelve el motivo con la respuesta y no en el estado del hook: quien
     * lo llama está dentro de un `onPress` que ya capturó el estado
     * anterior, y leería el error de la vez pasada.
     */
    assign: async (jobId: string, proId: string) => {
      try {
        return { ok: true as const, result: await mutation.mutateAsync({ jobId, proId }), error: null }
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
    isAssigning: mutation.isPending,
  }
}

export function useRespondSubstitute() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: ({ jobId, accept }: { jobId: string; accept: boolean }) =>
      assignmentsApi.respondSubstitute(jobId, accept),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['jobs'] })
      void queryClient.invalidateQueries({ queryKey: inboxQueryKey() })
    },
  })

  return {
    respond: async (jobId: string, accept: boolean) => {
      try {
        return { ok: true as const, result: await mutation.mutateAsync({ jobId, accept }), error: null }
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
    isResponding: mutation.isPending,
  }
}
