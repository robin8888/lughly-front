/**
 * useAvailabilityCalendar
 * El horario mes a mes: qué horas trabaja cada día y qué tiene ya comprometido.
 *
 * Es la otra forma de mirar lo mismo que `useMyAvailability`, que trae el
 * horario semanal —"los martes, de 9 a 18"—. Aquí llega ya resuelto día a día,
 * con las excepciones de días sueltos, las ausencias, los festivos y las citas
 * cruzadas por el servidor.
 *
 * **Lo cruza el servidor y no esto** porque es la misma regla que decide qué
 * huecos se le pueden reservar a alguien: calculada dos veces acabaría con un
 * calendario que dice una cosa y una reserva que hace otra. Y `Intl` va
 * incompleto en Hermes, así que el día español tampoco se puede calcular aquí.
 *
 * Con `employeeId` es el de un trabajador y lo pide su empresa, igual que en
 * `useMyAvailability`: mismo dato y mismas reglas, solo cambia a qué dirección
 * se pregunta.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ApiError, NetworkError } from '@/api'
import {
  prosApi,
  type ApiAvailabilityCalendar,
  type ApiCalendarDay,
  type ApiDayWindow,
} from '@/api/pros.api'
import { employeesApi } from '@/api/employees.api'
import { availabilityQueryKey } from './useMyAvailability'

/**
 * La clave lleva el mes y el trabajador: sin el mes, pasar a octubre enseñaría
 * septiembre hasta que caducara, que es justo lo que se acaba de pedir cambiar.
 */
export function calendarQueryKey(month: string, employeeId?: string) {
  return employeeId
    ? (['employees', employeeId, 'availability', 'calendar', month] as const)
    : (['pro', 'availability', 'calendar', month] as const)
}

export function useAvailabilityCalendar(
  month: string,
  enabled = true,
  employeeId?: string,
) {
  return useQuery<ApiAvailabilityCalendar>({
    queryKey: calendarQueryKey(month, employeeId),
    queryFn: () =>
      employeeId
        ? employeesApi.availabilityCalendar(employeeId, month)
        : prosApi.availabilityCalendar(month),
    enabled,
    /**
     * Un minuto, como el horario semanal. Lo que cambia aquí lo cambia quien
     * mira, así que no hace falta refrescar más a menudo; lo que sí puede
     * cambiar por su cuenta —una cita nueva— se ve al volver a la pantalla.
     */
    staleTime: 60_000,
  })
}

/** Lo que devuelve cada operación: el motivo del fallo viaja con la respuesta */
type Result = { ok: boolean; error: string | null }

function toResult(error: unknown): Result {
  return {
    ok: false,
    error:
      error instanceof NetworkError || error instanceof ApiError ? error.message : null,
  }
}

export function useSetAvailabilityDay(month: string, employeeId?: string) {
  const queryClient = useQueryClient()

  /**
   * Al guardar un día se mete lo que devuelve el servidor en el mes que ya está
   * en pantalla, en vez de invalidarlo: el calendario no debe parpadear entero
   * por haber tocado una casilla. Lo que se guarda puede no ser lo enviado —las
   * franjas que se tocan se juntan—, así que se mete la respuesta.
   */
  const patchDay = (saved: ApiCalendarDay) => {
    queryClient.setQueryData<ApiAvailabilityCalendar>(
      calendarQueryKey(month, employeeId),
      (previous) =>
        previous && {
          ...previous,
          days: previous.days.map((day) => (day.date === saved.date ? saved : day)),
        },
    )
  }

  const save = useMutation({
    mutationFn: ({ date, windows }: { date: string; windows: ApiDayWindow[] }) =>
      employeeId
        ? employeesApi.setAvailabilityDay(employeeId, date, windows)
        : prosApi.setAvailabilityDay(date, windows),
    onSuccess: patchDay,
  })

  const clear = useMutation({
    mutationFn: (date: string) =>
      employeeId
        ? employeesApi.clearAvailabilityDay(employeeId, date)
        : prosApi.clearAvailabilityDay(date),
    onSuccess: patchDay,
  })

  return {
    /** Pone las horas de ese día. La lista vacía es "ese día no trabajo". */
    setDay: async (date: string, windows: ApiDayWindow[]): Promise<Result> => {
      try {
        await save.mutateAsync({ date, windows })
        return { ok: true, error: null }
      } catch (error) {
        return toResult(error)
      }
    },
    /** Quita lo puesto a ese día: vuelve a mandar el horario semanal. */
    clearDay: async (date: string): Promise<Result> => {
      try {
        await clear.mutateAsync(date)
        return { ok: true, error: null }
      } catch (error) {
        return toResult(error)
      }
    },
    isSaving: save.isPending || clear.isPending,
  }
}

/**
 * El atajo: las mismas horas a varios días de la semana de una vez.
 *
 * Cambia el horario **semanal**, así que el mes entero se repinta y hay que
 * invalidarlo: son veintitantos días distintos y no una casilla. Se invalida
 * también el horario semanal, que es lo que enseña el resto de la app.
 */
export function useSetAvailabilityWeekdays(employeeId?: string) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: ({
      weekdays,
      windows,
    }: {
      weekdays: number[]
      windows: ApiDayWindow[]
    }) =>
      employeeId
        ? employeesApi.setAvailabilityWeekdays(employeeId, weekdays, windows)
        : prosApi.setAvailabilityWeekdays(weekdays, windows),
    onSuccess: (saved) => {
      queryClient.setQueryData(availabilityQueryKey(employeeId), saved)

      void queryClient.invalidateQueries({
        queryKey: employeeId
          ? ['employees', employeeId, 'availability', 'calendar']
          : ['pro', 'availability', 'calendar'],
      })
    },
  })

  return {
    apply: async (weekdays: number[], windows: ApiDayWindow[]): Promise<Result> => {
      try {
        await mutation.mutateAsync({ weekdays, windows })
        return { ok: true, error: null }
      } catch (error) {
        return toResult(error)
      }
    },
    isSaving: mutation.isPending,
  }
}
