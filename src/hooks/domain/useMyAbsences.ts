/**
 * useMyAbsences
 * Los días que el profesional no está.
 *
 * Al cambiarlos se invalida el directorio y su ficha: mientras dura una
 * ausencia desaparece de "disponible ahora", y con la caché sin refrescar
 * seguiría saliendo disponible.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ApiError, NetworkError } from '@/api'
import { prosApi, type ApiAbsence } from '@/api/pros.api'
import { employeesApi } from '@/api/employees.api'

/** Con trabajador en la clave: si no, se verían las vacaciones del anterior */
export function absencesQueryKey(employeeId?: string) {
  return employeeId
    ? (['employees', employeeId, 'absences'] as const)
    : (['pro', 'absences'] as const)
}

export function useMyAbsences(enabled = true, employeeId?: string) {
  return useQuery<ApiAbsence[]>({
    queryKey: absencesQueryKey(employeeId),
    queryFn: () =>
      employeeId ? employeesApi.absences(employeeId) : prosApi.myAbsences(),
    enabled,
    staleTime: 60_000,
  })
}

export function useManageMyAbsences(employeeId?: string) {
  const queryClient = useQueryClient()

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: absencesQueryKey(employeeId) })
    // Su disponibilidad sale de aquí: si no, seguiría anunciándose disponible
    void queryClient.invalidateQueries({ queryKey: ['pros'] })
  }

  const add = useMutation({
    mutationFn: (input: { startsOn: string; endsOn: string; reason?: string }) =>
      employeeId ? employeesApi.addAbsence(employeeId, input) : prosApi.addAbsence(input),
    onSuccess: refresh,
  })

  const remove = useMutation({
    mutationFn: (id: string) =>
      employeeId ? employeesApi.removeAbsence(employeeId, id) : prosApi.removeAbsence(id),
    onSuccess: refresh,
  })

  const message = (error: unknown) =>
    error instanceof NetworkError || error instanceof ApiError ? error.message : null

  return {
    /**
     * Devuelven el motivo con la respuesta y no en el estado del hook: quien
     * las llama está dentro de un `onPress` que ya capturó el estado anterior,
     * así que leería el error de la vez pasada.
     */
    add: async (input: {
      startsOn: string
      endsOn: string
      reason?: string
    }): Promise<{ ok: boolean; error: string | null }> => {
      try {
        await add.mutateAsync(input)
        return { ok: true, error: null }
      } catch (error) {
        return { ok: false, error: message(error) }
      }
    },
    remove: async (id: string): Promise<{ ok: boolean; error: string | null }> => {
      try {
        await remove.mutateAsync(id)
        return { ok: true, error: null }
      } catch (error) {
        return { ok: false, error: message(error) }
      }
    },
    isWorking: add.isPending || remove.isPending,
  }
}
