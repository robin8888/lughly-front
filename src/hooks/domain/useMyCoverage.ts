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

export function coverageQueryKey() {
  return ['pro', 'coverage'] as const
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

export function useMyCoverage(enabled = true) {
  return useQuery<ApiCoverageSettings>({
    queryKey: coverageQueryKey(),
    queryFn: () => prosApi.myCoverage(),
    enabled,
    staleTime: 60_000,
  })
}

/**
 * La zona es de quien se desplaza, también si trabaja para una empresa.
 *
 * Hasta el 7 de septiembre de 2026 esto tenía una segunda forma —la empresa
 * ponía la de cada uno de los suyos— y el servidor rechazaba con un 403 que
 * un empleado pusiera la propia. Salía caro al revés de lo que parecía: el
 * alta de un trabajador no pide dirección, así que entraba sin punto en el
 * mapa y no salía en ninguna búsqueda por cercanía hasta que su empresa se
 * acordara de entrar a ponérsela.
 */
export function useSetMyCoverage() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (input: CoverageInput) => prosApi.setMyCoverage(input),
    onSuccess: (saved) => {
      queryClient.setQueryData(coverageQueryKey(), saved)
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
      void queryClient.invalidateQueries({ queryKey: ['pro', 'holidays'] })
      /*
        Y la lista de trabajadores de su empresa, si la tiene: ahí sale en
        rojo o en verde si este ya está en el mapa (`setup.hasLocation`).
      */
      void queryClient.invalidateQueries({ queryKey: ['employees'] })
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
