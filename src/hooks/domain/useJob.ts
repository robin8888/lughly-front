/**
 * useJob
 * La ficha completa de un trabajo.
 *
 * Sirve a los dos lados: el servidor decide qué enseña según quién pregunte,
 * así que aquí no hay dos hooks ni dos rutas.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ApiError, NetworkError } from '@/api'
import { jobsApi, type ApiJobDetail } from '@/api/jobs.api'

export function jobQueryKey(jobId: string) {
  return ['jobs', 'detail', jobId] as const
}

export function useJob(jobId: string | undefined) {
  return useQuery<ApiJobDetail>({
    queryKey: jobQueryKey(jobId ?? ''),
    queryFn: () => jobsApi.detail(jobId as string),
    // Sin id no se pide nada: Expo Router entrega los parámetros de la ruta
    // en el segundo render, y el primero llegaría aquí con `undefined`.
    enabled: Boolean(jobId),
    /**
     * Corto: es la pantalla donde se mira si ya han contestado, y volver a
     * ella para ver lo mismo de hace diez minutos es justo lo que no se
     * espera.
     */
    staleTime: 15_000,
  })
}

/**
 * Cancelar un trabajo propio.
 *
 * Al cancelar cambian su ficha y la lista, y si era una subasta también las
 * pujas: se refresca todo lo de trabajos en vez de ir campo a campo.
 */
export function useCancelJob() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (jobId: string) => jobsApi.cancel(jobId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['jobs'] })
    },
  })

  return {
    cancel: async (jobId: string) => {
      try {
        await mutation.mutateAsync(jobId)
        return { ok: true as const, error: null }
      } catch (error) {
        return {
          ok: false as const,
          error:
            error instanceof NetworkError || error instanceof ApiError
              ? error.message
              : null,
        }
      }
    },
    isCancelling: mutation.isPending,
  }
}
