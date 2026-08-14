/**
 * usePublishJob
 * Publica el trabajo y limpia el borrador.
 *
 * El borrador se borra **solo al confirmar el servidor**. Si se limpiara al
 * pulsar publicar, un fallo de red dejaría al usuario sin lo que había
 * escrito y sin trabajo publicado, que es la peor combinación posible.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ApiError, NetworkError } from '@/api'
import { jobsApi, type ApiJob, type CreateJobPayload } from '@/api/jobs.api'
import { useDraftJobStore } from '@/stores/useDraftJobStore'

export function myJobsQueryKey() {
  return ['jobs', 'mine'] as const
}

export interface PublishJobResult {
  publish: (payload: CreateJobPayload) => Promise<ApiJob | null>
  isPublishing: boolean
  /** Errores por campo, tal como los devuelve el servidor */
  fieldErrors: Partial<Record<keyof CreateJobPayload, string>>
  formError: string | null
  reset: () => void
}

export function usePublishJob(): PublishJobResult {
  const queryClient = useQueryClient()
  const clearDraft = useDraftJobStore((s) => s.clear)

  const mutation = useMutation({
    mutationFn: (payload: CreateJobPayload) => jobsApi.create(payload),
    onSuccess: () => {
      clearDraft()
      // La lista de "mis trabajos" acaba de quedarse vieja
      void queryClient.invalidateQueries({ queryKey: myJobsQueryKey() })
    },
  })

  const error = mutation.error

  return {
    publish: async (payload) => {
      try {
        return await mutation.mutateAsync(payload)
      } catch {
        // El error ya queda en `mutation.error`; aquí solo se evita que
        // reviente la pantalla. Quien llama mira `formError`.
        return null
      }
    },
    isPublishing: mutation.isPending,
    fieldErrors:
      error instanceof ApiError
        ? error.toFieldErrors<CreateJobPayload>()
        : {},
    formError:
      error instanceof NetworkError
        ? error.message
        : error instanceof ApiError && error.details.length === 0
          ? error.message
          : null,
    reset: () => mutation.reset(),
  }
}
