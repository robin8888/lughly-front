/**
 * useUrgencyWindows
 * El horario de urgencias de un trabajador, que fija su empleador.
 *
 * Al guardarlo se invalida también el directorio: dentro de la franja el
 * trabajador aparece disponible, y si la caché no se refresca seguiría
 * saliendo como estaba hasta que caducara.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ApiError, NetworkError } from '@/api'
import { employeesApi, type ApiUrgencyWindow } from '@/api/employees.api'

export function urgencyWindowsQueryKey(employeeId: string) {
  return ['employees', employeeId, 'urgency-windows'] as const
}

export function useUrgencyWindows(employeeId: string | undefined) {
  return useQuery<ApiUrgencyWindow[]>({
    queryKey: urgencyWindowsQueryKey(employeeId ?? ''),
    queryFn: () => employeesApi.urgencyWindows(employeeId as string),
    enabled: Boolean(employeeId),
    staleTime: 60_000,
  })
}

export function useSetUrgencyWindows(employeeId: string | undefined) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (windows: ApiUrgencyWindow[]) =>
      employeesApi.setUrgencyWindows(employeeId as string, windows),
    onSuccess: (saved) => {
      queryClient.setQueryData(urgencyWindowsQueryKey(employeeId ?? ''), saved)
      // Su disponibilidad en el directorio sale de estas franjas
      void queryClient.invalidateQueries({ queryKey: ['pros'] })
    },
  })

  return {
    /**
     * Devuelve el motivo del fallo con la respuesta y no en el estado del
     * hook: quien lo llama suele estar dentro de un `onPress` que ya capturó
     * el estado anterior, y leería siempre el error de la vez pasada.
     */
    save: async (
      windows: ApiUrgencyWindow[],
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
