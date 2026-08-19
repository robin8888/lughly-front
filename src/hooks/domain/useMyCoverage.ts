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

export const myCoverageQueryKey = ['pro', 'coverage'] as const

export interface CoverageInput {
  latitude: number
  longitude: number
  radiusKm: number
  city?: string
}

export function useMyCoverage(enabled = true) {
  return useQuery<ApiCoverageSettings>({
    queryKey: myCoverageQueryKey,
    queryFn: () => prosApi.myCoverage(),
    enabled,
    staleTime: 60_000,
  })
}

export function useSetMyCoverage() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (input: CoverageInput) => prosApi.setMyCoverage(input),
    onSuccess: (saved) => {
      queryClient.setQueryData(myCoverageQueryKey, saved)
      // Su radio y su ciudad salen en el directorio y en su ficha
      void queryClient.invalidateQueries({ queryKey: ['pros'] })
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
