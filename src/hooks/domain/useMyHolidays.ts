/**
 * useMyHolidays
 * Los festivos de su comunidad y qué hace en cada uno.
 *
 * La comunidad sale del código postal de su base, así que esto depende de la
 * zona: quien no la tenga puesta recibe `region` a null y la pantalla se lo
 * dice en vez de enseñar una lista vacía, que parecería un año sin fiestas.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ApiError, NetworkError } from '@/api'
import { prosApi, type ApiHolidayCalendar } from '@/api/pros.api'
import { employeesApi } from '@/api/employees.api'

/** Con el año dentro: un calendario es de un año y no se comparte caché */
export function holidaysQueryKey(year: number, employeeId?: string) {
  return employeeId
    ? (['employees', employeeId, 'holidays', year] as const)
    : (['pro', 'holidays', year] as const)
}

export function useMyHolidays(year: number, enabled = true, employeeId?: string) {
  return useQuery<ApiHolidayCalendar>({
    queryKey: holidaysQueryKey(year, employeeId),
    queryFn: () =>
      employeeId
        ? employeesApi.holidays(employeeId, year)
        : prosApi.myHolidays(year),
    enabled,
    /**
     * Un calendario laboral no cambia en toda una sesión: lo publica el BOE una
     * vez al año. Lo que sí cambia es lo que él decide, y eso se refresca al
     * decidirlo.
     */
    staleTime: 5 * 60_000,
  })
}

export function useSetHolidayChoice(year: number, employeeId?: string) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (input: { date: string; appliesSurcharge: boolean }) =>
      employeeId
        ? employeesApi.setHolidayChoice(employeeId, input.date, input.appliesSurcharge)
        : prosApi.setMyHolidayChoice(input.date, input.appliesSurcharge),
    onSuccess: (saved) => {
      /**
       * Se cambia el día que se ha tocado en vez de recargar el año entero: la
       * lista está en pantalla y volver a pedirla la haría parpadear por un
       * interruptor.
       */
      queryClient.setQueryData<ApiHolidayCalendar>(
        holidaysQueryKey(year, employeeId),
        (previous) =>
          previous
            ? {
                ...previous,
                holidays: previous.holidays.map((holiday) =>
                  holiday.date === saved.date ? saved : holiday,
                ),
              }
            : previous,
      )
    },
  })

  const message = (error: unknown) =>
    error instanceof NetworkError || error instanceof ApiError ? error.message : null

  return {
    choose: async (
      date: string,
      appliesSurcharge: boolean,
    ): Promise<{ ok: boolean; error: string | null }> => {
      try {
        await mutation.mutateAsync({ date, appliesSurcharge })
        return { ok: true, error: null }
      } catch (error) {
        return { ok: false, error: message(error) }
      }
    },
    isSaving: mutation.isPending,
  }
}
