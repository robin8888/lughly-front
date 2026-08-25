/**
 * Traducción de errores de API a estado de formulario.
 *
 * El backend ya devuelve los mensajes en español y con un `code` estable,
 * así que la app no reescribe textos: solo decide si el error va al campo
 * o a la cabecera del formulario.
 */

import { ApiError, NetworkError } from '@/api'
import type { FieldErrors } from '@/utils/formErrors'

export interface AuthErrorState<T> {
  fieldErrors: FieldErrors<T>
  formError: string | null
}

export function toAuthErrorState<T>(
  error: unknown,
  fallbackMessage: string,
): AuthErrorState<T> {
  if (error instanceof ApiError) {
    if (error.code === 'VALIDATION_ERROR' && error.details.length > 0) {
      /**
       * Además de marcar los campos, un aviso de cabecera. Los mensajes de
       * campo se pintan junto a su campo, y en un formulario largo —el alta—
       * el botón de enviar queda lejos de todos ellos: sin esto, un rechazo
       * del servidor no produce ninguna señal donde el usuario está mirando
       * y el botón parece muerto. Con un solo fallo se repite su mensaje, que
       * dice qué corregir; con varios no cabe ninguno y se remite a las marcas.
       */
      const formError =
        error.details.length === 1
          ? error.details[0]!.message
          : 'Revisa los campos marcados.';

      return { fieldErrors: error.toFieldErrors<T>(), formError }
    }

    return { fieldErrors: {}, formError: error.message }
  }

  if (error instanceof NetworkError) {
    return { fieldErrors: {}, formError: error.message }
  }

  return { fieldErrors: {}, formError: fallbackMessage }
}
