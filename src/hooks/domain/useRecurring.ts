/**
 * useRecurring
 * Contratar a alguien de forma fija (`CICLOS_DE_CONTRATACION.md` §F).
 *
 * Son dos pasos y no uno, y por eso son dos hooks:
 *
 * 1. **Comprobar** qué días de la serie le caben, día a día. No reserva nada,
 *    así que se puede volver a pedir todas las veces que haga falta mientras
 *    el cliente mueve la hora o cambia los días.
 * 2. **Contratar**, con los días movidos que haya elegido.
 *
 * El primero es una mutación y no una consulta a propósito: lo que se pregunta
 * no es "cuál es el estado de algo", es "¿y si hago esto?", y va por POST
 * porque los días de la semana son una lista.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ApiError, NetworkError } from '@/api'
import { prosApi, type ApiRecurrenceCheck } from '@/api/pros.api'
import {
  assignmentsApi,
  type ApiBookedRecurring,
  type BookRecurringPayload,
} from '@/api/assignments.api'

/** Cuántas semanas se miran de una vez: las mismas que se contratan */
export const SERIES_WEEKS = 8

function mensajeDe(error: unknown): string | null {
  return error instanceof NetworkError || error instanceof ApiError
    ? error.message
    : null
}

export function useRecurrenceCheck(proId: string | undefined) {
  const mutation = useMutation({
    mutationFn: (payload: {
      weekdays: number[]
      from: string
      durationMin: number
      startsOn: string
    }) =>
      prosApi.recurrenceCheck(proId as string, { ...payload, weeks: SERIES_WEEKS }),
  })

  return {
    check: async (payload: {
      weekdays: number[]
      from: string
      durationMin: number
      startsOn: string
    }): Promise<{ ok: boolean; result: ApiRecurrenceCheck | null; error: string | null }> => {
      try {
        return { ok: true, result: await mutation.mutateAsync(payload), error: null }
      } catch (error) {
        return { ok: false, result: null, error: mensajeDe(error) }
      }
    },
    isChecking: mutation.isPending,
    /** Lo último que contestó, para pintar el repaso sin volver a preguntar */
    result: mutation.data ?? null,
  }
}

/**
 * Contratar la serie.
 *
 * **No pasa por el 3D Secure**, y no es un olvido: aquí no se cobra nada. Se
 * guarda la tarjeta y cada sesión se retiene 24 h antes, así que no hay ningún
 * pago que el banco pueda pedir autenticar en este momento.
 */
export function useBookRecurring(proId: string | undefined) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (payload: BookRecurringPayload) =>
      assignmentsApi.bookRecurring(proId as string, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['jobs'] })
    },
  })

  return {
    book: async (
      payload: BookRecurringPayload,
    ): Promise<{ ok: boolean; result: ApiBookedRecurring | null; error: string | null }> => {
      try {
        return { ok: true, result: await mutation.mutateAsync(payload), error: null }
      } catch (error) {
        return { ok: false, result: null, error: mensajeDe(error) }
      }
    },
    isBooking: mutation.isPending,
  }
}
