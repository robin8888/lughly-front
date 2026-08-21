/**
 * useBookServices
 * Contratar la carta de un profesional: se cobra en el momento.
 *
 * Al enviarlo se invalida la lista de trabajos, igual que un encargo
 * normal: el encargo aparece ahí esperando respuesta, con la diferencia de
 * que este ya está cobrado.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ApiError, NetworkError } from '@/api'
import {
  assignmentsApi,
  type ApiBookedServices,
  type BookServicesPayload,
} from '@/api/assignments.api'
import type { FieldErrors } from '@/utils/formErrors'

export function useBookServices(proId: string | undefined) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (payload: BookServicesPayload) =>
      assignmentsApi.bookServices(proId as string, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['jobs'] })
    },
  })

  const error = mutation.error

  return {
    book: async (payload: BookServicesPayload): Promise<ApiBookedServices | null> => {
      try {
        return await mutation.mutateAsync(payload)
      } catch {
        return null
      }
    },
    isBooking: mutation.isPending,
    fieldErrors:
      error instanceof ApiError
        ? error.toFieldErrors<BookServicesPayload>()
        : ({} as FieldErrors<BookServicesPayload>),
    /**
     * El mensaje suelto: sin tarjeta, cuenta de cobro sin verificar o el
     * cobro rechazado no son errores de un campo del formulario, son el
     * motivo por el que este contrato concreto no puede salir.
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
