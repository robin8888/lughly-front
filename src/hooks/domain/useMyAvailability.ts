/**
 * useMyAvailability
 * El horario ordinario de trabajo propio: cuándo se le puede reservar.
 *
 * No es el interruptor de "disponible ahora", que dice si sale corriendo a una
 * urgencia en este momento, ni son las franjas de urgencia de un empleado, que
 * llevan su propia tarifa. Esto es a qué horas trabaja normalmente.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ApiError, NetworkError } from '@/api'
import { prosApi, type ApiAvailabilityWindow } from '@/api/pros.api'

export const myAvailabilityQueryKey = ['pro', 'availability'] as const

export function useMyAvailability(enabled = true) {
  return useQuery<ApiAvailabilityWindow[]>({
    queryKey: myAvailabilityQueryKey,
    queryFn: () => prosApi.myAvailability(),
    enabled,
    staleTime: 60_000,
  })
}

export function useSetMyAvailability() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (windows: ApiAvailabilityWindow[]) =>
      prosApi.setMyAvailability(windows),
    /**
     * Se guarda lo que devuelve el servidor, no lo que se mandó: allí se
     * juntan las franjas que se tocan y se parten las que cruzan la medianoche,
     * así que lo enviado y lo guardado no tienen por qué coincidir.
     */
    onSuccess: (saved) => {
      queryClient.setQueryData(myAvailabilityQueryKey, saved)
    },
  })

  return {
    /**
     * El motivo del fallo viaja con la respuesta y no en el estado del hook:
     * quien llama suele estar dentro de un `onPress` que ya capturó el estado
     * anterior, y leería el error de la vez pasada.
     */
    save: async (
      windows: ApiAvailabilityWindow[],
    ): Promise<{ ok: boolean; error: string | null }> => {
      try {
        await mutation.mutateAsync(windows)
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
