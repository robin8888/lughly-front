/**
 * useMyCoverage
 * La zona de cobertura propia: dónde tiene la base y hasta dónde se desplaza.
 *
 * Al guardarla se invalida el directorio y su propia ficha: el radio sale en
 * las dos, y con la caché sin refrescar seguiría enseñando el de antes.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ApiError, NetworkError } from '@/api'
import { prosApi, type ApiCoverageSettings } from '@/api/pros.api'
import { employeesApi } from '@/api/employees.api'

/** Con trabajador en la clave: dos empleados seguidos enseñarían la misma zona */
export function coverageQueryKey(employeeId?: string) {
  return employeeId
    ? (['employees', employeeId, 'coverage'] as const)
    : (['pro', 'coverage'] as const)
}

export interface CoverageInput {
  latitude: number
  longitude: number
  radiusKm: number
  city?: string
  /**
   * Viaja cuando el geocodificador lo da. Sin él no se sabe de qué comunidad
   * es la base, y sin comunidad la pantalla de festivos no tiene nada que
   * enseñar.
   */
  postcode?: string | null
}

export function useMyCoverage(enabled = true, employeeId?: string) {
  return useQuery<ApiCoverageSettings>({
    queryKey: coverageQueryKey(employeeId),
    queryFn: () =>
      employeeId ? employeesApi.coverage(employeeId) : prosApi.myCoverage(),
    enabled,
    staleTime: 60_000,
  })
}

export function useSetMyCoverage(employeeId?: string) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (input: CoverageInput) =>
      employeeId
        ? employeesApi.setCoverage(employeeId, input)
        : prosApi.setMyCoverage(input),
    onSuccess: (saved) => {
      queryClient.setQueryData(coverageQueryKey(employeeId), saved)
      // Su radio y su ciudad salen en el directorio y en su ficha
      void queryClient.invalidateQueries({ queryKey: ['pros'] })
      /**
       * Y su calendario de festivos, que cuelga del código postal de la base:
       * mover la zona puede cambiarle de comunidad.
       *
       * Sin esto pasaba lo peor que podía pasar: el calendario decía "te falta
       * la zona", se ponía la zona, se volvía, y seguía diciendo lo mismo
       * —porque la respuesta de antes aún estaba fresca—, así que parecía que
       * no se había guardado.
       */
      void queryClient.invalidateQueries({
        queryKey: employeeId
          ? ['employees', employeeId, 'holidays']
          : ['pro', 'holidays'],
      })
    },
  })

  return {
    /**
     * El motivo del fallo viaja con la respuesta y no en el estado del hook:
     * quien llama suele estar dentro de un `onPress` que ya capturó el estado
     * anterior, y leería el error de la vez pasada.
     */
    save: async (
      input: CoverageInput,
    ): Promise<{ ok: boolean; error: string | null }> => {
      try {
        await mutation.mutateAsync(input)
        return { ok: true, error: null }
      } catch (error) {
        return {
          ok: false,
          error:
            error instanceof NetworkError || error instanceof ApiError
              ? error.message
              : null,
        }
      }
    },
    isSaving: mutation.isPending,
  }
}
