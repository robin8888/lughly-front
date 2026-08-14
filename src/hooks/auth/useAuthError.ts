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
      return { fieldErrors: error.toFieldErrors<T>(), formError: null }
    }

    return { fieldErrors: {}, formError: error.message }
  }

  if (error instanceof NetworkError) {
    return { fieldErrors: {}, formError: error.message }
  }

  return { fieldErrors: {}, formError: fallbackMessage }
}
