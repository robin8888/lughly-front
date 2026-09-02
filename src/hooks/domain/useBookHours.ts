/**
 * useBookHours
 * Reservar horas de un profesional: se **retiene** en el momento, y se cobra
 * cuando él acepta.
 *
 * Es lo mismo que `useBookServices` con dos diferencias que importan:
 *
 * - **El hueco queda apartado desde ya**, incluso mientras el banco pide
 *   autenticación. El cliente ha elegido una hora concreta y ha puesto el
 *   dinero; seguir ofreciendo ese jueves a las diez sería venderlo dos veces.
 *   Si abandona el reto del banco, el barrido de plazos lo suelta solo.
 * - **Vuelve el desglose cobrado**, para poder enseñar en la confirmación lo
 *   mismo que se vio antes de pagar sin volver a pedirlo.
 *
 * El 3D Secure se resuelve aquí dentro, igual que en la carta: para la
 * pantalla es una sola llamada que a veces tarda más.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useStripe } from '@stripe/stripe-react-native'
import { ApiError, NetworkError } from '@/api'
import {
  assignmentsApi,
  type ApiBookedHours,
  type BookHoursPayload,
} from '@/api/assignments.api'
import type { FieldErrors } from '@/utils/formErrors'
import { CardAuthError } from './useBookServices'

export function useBookHours(proId: string | undefined) {
  const queryClient = useQueryClient()
  const { handleNextAction } = useStripe()

  const mutation = useMutation({
    mutationFn: async (payload: BookHoursPayload): Promise<ApiBookedHours> => {
      const booking = await assignmentsApi.bookHours(proId as string, payload)

      if (booking.status === 'booked') return booking

      if (!booking.clientSecret) {
        throw new CardAuthError(
          'Tu banco pide confirmar el pago y no hemos podido abrir la confirmación. Inténtalo de nuevo.',
        )
      }

      const { error } = await handleNextAction(booking.clientSecret)

      if (error) {
        throw new CardAuthError(
          error.message ??
            'No se ha podido confirmar el pago con tu banco. No se te ha cobrado nada.',
        )
      }

      /*
        Quien dice si salió bien es el servidor, que se lo pregunta a Stripe:
        que aquí no haya `error` significa que el reto se cerró, no que el
        banco haya aceptado. La segunda llamada devuelve la reserva sin el
        desglose —es la de la carta—, así que se conserva el que ya traía la
        primera: es el mismo precio, y lo ha cobrado el servidor.
      */
      const confirmed = await assignmentsApi.confirmPayment(booking.jobId)

      if (confirmed.status !== 'booked') {
        throw new CardAuthError(
          'Tu banco todavía no ha confirmado el pago. Espera un momento y vuelve a intentarlo.',
        )
      }

      return { ...confirmed, price: booking.price }
    },
    onSuccess: () => {
      /*
        Los trabajos, porque ahí aparece el encargo esperando respuesta; y los
        huecos del profesional, porque el que se acaba de reservar ya no está
        libre y quien vuelva atrás no debe verlo.
      */
      void queryClient.invalidateQueries({ queryKey: ['jobs'] })
      void queryClient.invalidateQueries({ queryKey: ['pro', proId, 'slots'] })
    },
  })

  const error = mutation.error

  return {
    book: async (payload: BookHoursPayload): Promise<ApiBookedHours | null> => {
      try {
        return await mutation.mutateAsync(payload)
      } catch {
        return null
      }
    },
    isBooking: mutation.isPending,
    fieldErrors:
      error instanceof ApiError
        ? error.toFieldErrors<BookHoursPayload>()
        : ({} as FieldErrors<BookHoursPayload>),
    /**
     * El mensaje suelto: el hueco que se ha ido mientras se decidía, la cuenta
     * de cobro sin verificar, la tarjeta rechazada o la autenticación que no
     * salió no son errores de un campo del formulario, son el motivo por el
     * que esta reserva concreta no puede salir.
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
