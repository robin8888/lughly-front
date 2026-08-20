/**
 * useMySurcharges
 * Los recargos por sábado, domingo o festivo y nocturno.
 *
 * Al cambiarlos se invalida el directorio y su ficha: los recargos salen en la
 * ficha del profesional, y con la caché sin refrescar el cliente seguiría
 * leyendo los de antes mientras se le cobran los nuevos.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ApiError, NetworkError } from '@/api'
import { prosApi, type ApiSurcharges } from '@/api/pros.api'
import { employeesApi } from '@/api/employees.api'

/** Con trabajador en la clave: si no, se verían los del anterior */
export function surchargesQueryKey(employeeId?: string) {
  return employeeId
    ? (['employees', employeeId, 'surcharges'] as const)
    : (['pro', 'surcharges'] as const)
}

export interface SurchargesInput {
  saturday: number
  sunday: number
  night: number
}

export function useMySurcharges(enabled = true, employeeId?: string) {
  return useQuery<ApiSurcharges>({
    queryKey: surchargesQueryKey(employeeId),
    queryFn: () =>
      employeeId ? employeesApi.surcharges(employeeId) : prosApi.mySurcharges(),
    enabled,
    staleTime: 60_000,
  })
}

export function useSetMySurcharges(employeeId?: string) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (input: SurchargesInput) =>
      employeeId
        ? employeesApi.setSurcharges(employeeId, input)
        : prosApi.setMySurcharges(input),
    onSuccess: (saved) => {
      queryClient.setQueryData(surchargesQueryKey(employeeId), saved)
      // Salen en su ficha, y el calendario de festivos cuelga del de domingos
      void queryClient.invalidateQueries({ queryKey: ['pros'] })
      void queryClient.invalidateQueries({
        queryKey: employeeId ? ['employees', employeeId, 'holidays'] : ['pro', 'holidays'],
      })
    },
  })

  const message = (error: unknown) =>
    error instanceof NetworkError || error instanceof ApiError ? error.message : null

  return {
    /**
     * El motivo del fallo viaja con la respuesta y no en el estado del hook:
     * quien llama está dentro de un `onPress` que ya capturó el estado
     * anterior, así que leería el error de la vez pasada.
     */
    save: async (
      input: SurchargesInput,
    ): Promise<{ ok: boolean; error: string | null }> => {
      try {
        await mutation.mutateAsync(input)
        return { ok: true, error: null }
      } catch (error) {
        return { ok: false, error: message(error) }
      }
    },
    isSaving: mutation.isPending,
  }
}
