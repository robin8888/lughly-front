/**
 * useBookServices
 * Contratar la carta de un profesional: se **retiene** en el momento, y se
 * cobra cuando el profesional acepta.
 *
 * Al enviarlo se invalida la lista de trabajos, igual que un encargo normal:
 * el encargo aparece ahí esperando respuesta, con la diferencia de que este ya
 * tiene el dinero apartado.
 *
 * ## El 3D Secure vive aquí
 *
 * El cobro se confirma en el servidor con la tarjeta guardada, pero el banco
 * puede pedir autenticación —en España, a menudo—. Entonces el servidor
 * devuelve `requires_action` con un `clientSecret`, la app abre el reto con
 * `handleNextAction`, y una segunda llamada cierra la contratación. Las tres
 * cosas pasan dentro de `book()` a propósito: para la pantalla es la misma
 * llamada de siempre que tarda un poco más, y así no hay dos caminos de
 * contratación que mantener en paralelo.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useStripe } from '@stripe/stripe-react-native'
import { ApiError, NetworkError } from '@/api'
import {
  assignmentsApi,
  type ApiBookedServices,
  type BookServicesPayload,
} from '@/api/assignments.api'
import type { FieldErrors } from '@/utils/formErrors'

/**
 * La autenticación de la tarjeta no ha salido adelante: la cerró el cliente,
 * el banco dijo que no, o se quedó a medias. Es un error suyo que se puede
 * leer y arreglar —cambiar de tarjeta, reintentar—, no un fallo interno, y por
 * eso se enseña tal cual en el formulario.
 */
export class CardAuthError extends Error {}

export function useBookServices(proId: string | undefined) {
  const queryClient = useQueryClient()
  const { handleNextAction } = useStripe()

  const mutation = useMutation({
    mutationFn: async (payload: BookServicesPayload): Promise<ApiBookedServices> => {
      const booking = await assignmentsApi.bookServices(proId as string, payload)

      if (booking.status === 'booked') return booking

      if (!booking.clientSecret) {
        throw new CardAuthError(
          'Tu banco pide confirmar el pago y no hemos podido abrir la confirmación. Inténtalo de nuevo.',
        )
      }

      /*
        El reto del banco. Cerrarlo sin terminar devuelve `error`, igual que un
        rechazo: para el cliente son lo mismo —no ha contratado— y el encargo
        se queda en borrador hasta que el servidor lo suelte solo.
      */
      const { error } = await handleNextAction(booking.clientSecret)

      if (error) {
        throw new CardAuthError(
          error.message ??
            'No se ha podido confirmar el pago con tu banco. No se te ha cobrado nada.',
        )
      }

      /*
        Y quien dice si de verdad salió bien es el servidor, que se lo pregunta
        a Stripe. Que aquí no haya `error` significa que el reto se cerró, no
        que el banco haya aceptado.
      */
      const confirmed = await assignmentsApi.confirmPayment(booking.jobId)

      if (confirmed.status !== 'booked') {
        throw new CardAuthError(
          'Tu banco todavía no ha confirmado el pago. Espera un momento y vuelve a intentarlo.',
        )
      }

      return confirmed
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
