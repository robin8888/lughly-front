/**
 * useRequestPro
 * El cliente encarga un trabajo a un profesional concreto del directorio.
 *
 * Al enviarlo se invalida la lista de trabajos: el encargo aparece ahí como
 * uno más, esperando respuesta, y es donde el cliente va a mirar si le han
 * contestado.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ApiError, NetworkError } from '@/api'
import {
  assignmentsApi,
  type ApiDirectRequest,
  type RequestProPayload,
} from '@/api/assignments.api'
import type { FieldErrors } from '@/utils/formErrors'

export function useRequestPro(proId: string | undefined) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (payload: RequestProPayload) =>
      assignmentsApi.request(proId as string, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['jobs'] })
    },
  })

  const error = mutation.error

  return {
    request: async (payload: RequestProPayload): Promise<ApiDirectRequest | null> => {
      try {
        return await mutation.mutateAsync(payload)
      } catch {
        return null
      }
    },
    isRequesting: mutation.isPending,
    fieldErrors:
      error instanceof ApiError
        ? error.toFieldErrors<RequestProPayload>()
        : ({} as FieldErrors<RequestProPayload>),
    /**
     * El mensaje suelto: un oficio que no ejerce o un profesional que ya no
     * está no son errores de un campo del formulario, son motivos por los
     * que este encargo concreto no puede salir.
     */
    formError:
      error instanceof NetworkError
        ? error.message
        : error instanceof ApiError && error.details.length === 0
          ? error.message
          : null,
    reset: () => mutation.reset(),
  }
}
