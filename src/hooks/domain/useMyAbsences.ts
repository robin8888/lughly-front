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
import { prosApi, type ApiAbsence, type ApiAbsenceImpact } from '@/api/pros.api'
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
    }): Promise<{
      ok: boolean
      error: string | null
      /** Lo que se ha llevado por delante: sesiones fijas de esos días (§F6) */
      impact: ApiAbsenceImpact | null
    }> => {
      try {
        const absence = await add.mutateAsync(input)

        /*
          Y se refrescan los trabajos: al cliente se le acaban de caer unas
          sesiones, y al profesional le desaparecen de la agenda. Sin esto, la
          pantalla de la que viene seguiría enseñándolas hasta que caduquen.
        */
        if (absence.impact.sessions > 0) {
          void queryClient.invalidateQueries({ queryKey: ['jobs'] })
          void queryClient.invalidateQueries({ queryKey: ['pro', 'agenda'] })
        }

        return { ok: true, error: null, impact: absence.impact }
      } catch (error) {
        return { ok: false, error: message(error), impact: null }
      }
    },

    /**
     * Qué se llevaría por delante marcar esos días, **sin marcarlos**.
     *
     * Imperativo y no una consulta con clave: se pregunta al ir a confirmar, y
     * quien mueve el selector de fechas cambia de día muchas veces antes de
     * decidirse. Una consulta por cada toque sería una ráfaga al servidor para
     * enseñar algo que nadie está mirando todavía.
     *
     * Solo para las propias: las de un empleado las marca su empresa, y el
     * aviso previo de ese camino no existe todavía —al guardar sí se ve lo que
     * se ha llevado, que es lo que devuelve `add`—.
     */
    checkImpact: async (
      startsOn: string,
      endsOn: string,
    ): Promise<ApiAbsenceImpact | null> => {
      if (employeeId) return null

      try {
        return await prosApi.absenceImpact(startsOn, endsOn)
      } catch {
        /*
          Si falla, se sigue sin aviso previo. Bloquear unas vacaciones porque
          no hemos podido contar unas sesiones sería peor: el servidor las
          cancela y avisa igual, y quien marca sus días lo verá al guardar.
        */
        return null
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
