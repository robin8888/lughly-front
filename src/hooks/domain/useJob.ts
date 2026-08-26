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
 * Al cancelar cambian su ficha y la lista: se refresca todo lo de trabajos en
 * vez de ir campo a campo.
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

/**
 * Romper un trabajo ya contratado, con su motivo.
 *
 * Aparte de `useCancelJob` porque son dos cosas distintas: aquello es retirar
 * un anuncio que nadie ha tocado, y esto es decirle a alguien que había
 * apartado la mañana que ya no hace falta que venga. Por eso pide motivo, y
 * por eso lo pueden usar los dos lados.
 */
export function useCancelContract() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: ({ jobId, reason }: { jobId: string; reason: string }) =>
      jobsApi.cancelContract(jobId, reason),
    onSuccess: () => {
      /*
        Y la agenda con ellos: al profesional se le acaba de caer una visita, y
        dejarla en su día sería enseñarle algo a lo que ya no tiene que ir.
      */
      void queryClient.invalidateQueries({ queryKey: ['jobs'] })
      void queryClient.invalidateQueries({ queryKey: ['pro', 'agenda'] })
      void queryClient.invalidateQueries({ queryKey: ['pro', 'inbox'] })
    },
  })

  return {
    cancelContract: async (jobId: string, reason: string) => {
      try {
        const result = await mutation.mutateAsync({ jobId, reason })
        return { ok: true as const, result, error: null }
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
    isCancelling: mutation.isPending,
  }
}

/**
 * Volver a encargar un trabajo a otro profesional.
 *
 * Cambia su ficha y su sitio en la lista —vuelve a estar esperando respuesta—,
 * así que se refresca todo lo de trabajos.
 */
export function useReassignJob() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: ({ jobId, proId }: { jobId: string; proId: string }) =>
      jobsApi.reassign(jobId, proId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['jobs'] })
    },
  })

  return {
    reassign: async (jobId: string, proId: string) => {
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
    isReassigning: mutation.isPending,
  }
}
