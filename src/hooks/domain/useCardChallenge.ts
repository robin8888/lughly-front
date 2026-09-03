/**
 * useCardChallenge
 * El segundo tiempo de contratar, cuando el banco pide autenticar la tarjeta.
 *
 * El cobro se confirma en el servidor con la tarjeta guardada, pero el banco
 * puede exigir 3D Secure —en España, a menudo—. Entonces el servidor devuelve
 * `requires_action` con un `clientSecret`, la app abre el reto, y una segunda
 * llamada cierra la contratación.
 *
 * ## Por qué es una pieza y no tres copias
 *
 * Lo piden los tres caminos que cobran: la carta, las horas y la visita para
 * presupuesto. Estaba escrito dos veces —igual salvo un detalle— y la tercera
 * copia habría sido la que se quedara atrás: son cuatro mensajes de error y un
 * orden de pasos que **no se puede equivocar**, porque el paso que se salta es
 * el que decide si alguien trabaja gratis.
 *
 * El paso que no se puede saltar es el último: quien dice si el banco aceptó es
 * el servidor, que se lo pregunta a Stripe. Que `handleNextAction` no devuelva
 * error significa que el reto se cerró, **no** que el pago haya salido; fiarse
 * de eso dejaría contratado sin pagar a cualquiera que sepa cerrar un diálogo.
 */

import { useStripe } from '@stripe/stripe-react-native'
import { assignmentsApi, type ApiBookedServices } from '@/api/assignments.api'

/**
 * La autenticación de la tarjeta no ha salido adelante: la cerró el cliente,
 * el banco dijo que no, o se quedó a medias. Es un error suyo que se puede
 * leer y arreglar —cambiar de tarjeta, reintentar—, no un fallo interno, y por
 * eso se enseña tal cual en el formulario.
 */
export class CardAuthError extends Error {}

export function useCardChallenge() {
  const { handleNextAction } = useStripe()

  /**
   * Resuelve el reto y devuelve la contratación ya confirmada por el servidor.
   *
   * Lanza `CardAuthError` en todo lo que el cliente puede arreglar. Lo que
   * quede a medias —cierra la app, se le va la batería— lo recoge el barrido
   * del servidor a la media hora: suelta el intento y borra el borrador, así
   * que no queda nada que limpiar desde aquí.
   */
  return async (jobId: string, clientSecret: string | null): Promise<ApiBookedServices> => {
    if (!clientSecret) {
      throw new CardAuthError(
        'Tu banco pide confirmar el pago y no hemos podido abrir la confirmación. Inténtalo de nuevo.',
      )
    }

    /*
      El reto del banco. Cerrarlo sin terminar devuelve `error`, igual que un
      rechazo: para el cliente son lo mismo —no ha contratado— y lo pedido se
      queda en borrador hasta que el servidor lo suelte solo.
    */
    const { error } = await handleNextAction(clientSecret)

    if (error) {
      throw new CardAuthError(
        error.message ??
          'No se ha podido confirmar el pago con tu banco. No se te ha cobrado nada.',
      )
    }

    const confirmed = await assignmentsApi.confirmPayment(jobId)

    if (confirmed.status !== 'booked') {
      throw new CardAuthError(
        'Tu banco todavía no ha confirmado el pago. Espera un momento y vuelve a intentarlo.',
      )
    }

    return confirmed
  }
}
