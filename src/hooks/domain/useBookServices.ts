/**
 * useBookServices
 * Contratar la carta de un profesional: se **retiene** en el momento, y se
 * cobra cuando el profesional acepta.
 *
 * Al enviarlo se invalida la lista de trabajos, igual que un encargo normal:
 * el encargo aparece ahí esperando respuesta, con la diferencia de que este ya
 * tiene el dinero apartado.
 *
 * ## El 3D Secure vive dentro de `book()`
 *
 * El banco puede pedir autenticación —en España, a menudo—, y resolverlo son
 * tres pasos: abrir el reto, cerrarlo y preguntarle al servidor si de verdad
 * salió. Los tres pasan dentro de `book()` a propósito: para la pantalla es la
 * misma llamada de siempre que tarda un poco más, y así no hay dos caminos de
 * contratación que mantener en paralelo. Los pasos en sí viven en
 * `useCardChallenge`, que es la misma pieza que usan las horas y la visita.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ApiError, NetworkError } from '@/api'
import {
  assignmentsApi,
  type ApiBookedServices,
  type BookServicesPayload,
} from '@/api/assignments.api'
import type { FieldErrors } from '@/utils/formErrors'
import { CardAuthError, useCardChallenge } from './useCardChallenge'

export { CardAuthError }

export function useBookServices(proId: string | undefined) {
  const queryClient = useQueryClient()
  const resolveCardChallenge = useCardChallenge()

  const mutation = useMutation({
    mutationFn: async (payload: BookServicesPayload): Promise<ApiBookedServices> => {
      const booking = await assignmentsApi.bookServices(proId as string, payload)

      if (booking.status === 'booked') return booking

      return resolveCardChallenge(booking.jobId, booking.clientSecret)
    },
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
     * El mensaje suelto: sin tarjeta, cuenta de cobro sin verificar, el cobro
     * rechazado o la autenticación que no salió no son errores de un campo del
     * formulario, son el motivo por el que este contrato concreto no puede
     * salir.
     */
    formError:
      error instanceof NetworkError || error instanceof CardAuthError
        ? error.message
        : error instanceof ApiError && error.details.length === 0
          ? error.message
          : null,
    reset: () => mutation.reset(),
  }
}
