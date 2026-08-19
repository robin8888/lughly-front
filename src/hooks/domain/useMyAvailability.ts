/**
 * useMyAvailability
 * El horario ordinario de trabajo propio: cuándo se le puede reservar.
 *
 * No es el interruptor de "disponible ahora", que dice si sale corriendo a una
 * urgencia en este momento, ni son las franjas de urgencia de un empleado, que
 * llevan su propia tarifa. Esto es a qué horas trabaja normalmente.
 *
 * Con `employeeId` es el de un trabajador, y lo pide su empresa. Es el mismo
 * hook y no dos porque el dato y las reglas son los mismos —el servidor
 * comparte el código— y lo único que cambia es a qué dirección se pregunta.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ApiError, NetworkError } from '@/api'
import { prosApi, type ApiAvailabilityWindow } from '@/api/pros.api'
import { employeesApi } from '@/api/employees.api'

/**
 * La clave lleva el trabajador cuando lo hay: sin eso, abrir el horario de dos
 * empleados seguidos enseñaría el del primero en el segundo hasta que caducara.
 */
export function availabilityQueryKey(employeeId?: string) {
  return employeeId
    ? (['employees', employeeId, 'availability'] as const)
    : (['pro', 'availability'] as const)
}

export function useMyAvailability(enabled = true, employeeId?: string) {
  return useQuery<ApiAvailabilityWindow[]>({
    queryKey: availabilityQueryKey(employeeId),
    queryFn: () =>
      employeeId ? employeesApi.availability(employeeId) : prosApi.myAvailability(),
    enabled,
    staleTime: 60_000,
  })
}

export function useSetMyAvailability(employeeId?: string) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (windows: ApiAvailabilityWindow[]) =>
      employeeId
        ? employeesApi.setAvailability(employeeId, windows)
        : prosApi.setMyAvailability(windows),
    /**
     * Se guarda lo que devuelve el servidor, no lo que se mandó: allí se
     * juntan las franjas que se tocan y se parten las que cruzan la medianoche,
     * así que lo enviado y lo guardado no tienen por qué coincidir.
     */
    onSuccess: (saved) => {
      queryClient.setQueryData(availabilityQueryKey(employeeId), saved)
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
