/**
 * useUrgencyActions
 * Aceptar, empezar y cerrar una urgencia.
 *
 * Las tres invalidan a la vez la lista de urgencias, **la ficha del propio
 * profesional** y **su agenda**: aceptar le marca como ocupado y eso cambia
 * su "disponible ahora", que se ve en su home; empezar y terminar mueven el
 * trabajo entre "En curso" y "Terminada", que es lo que pinta `AgendaPage`.
 * Si solo se refrescase una, alguna pantalla se quedaría enseñando el estado
 * de antes.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Alert } from 'react-native'
import { ApiError } from '@/api'
import { urgenciesApi, type AcceptedUrgency } from '@/api/urgencies.api'
import { myUrgenciesQueryKey } from './useMyUrgencies'

export function useUrgencyActions(proId: string | undefined) {
  const queryClient = useQueryClient()

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: myUrgenciesQueryKey() })
    // La agenda (`AgendaPage`), que pinta el mismo trabajo por su `Job.status`
    void queryClient.invalidateQueries({ queryKey: ['pro', 'assignments'] })
    if (proId) void queryClient.invalidateQueries({ queryKey: ['pro', proId] })
  }

  const accept = useMutation({
    mutationFn: (jobId: string) => urgenciesApi.accept(jobId),
    onSuccess: invalidate,
    onError: (error) => {
      /**
       * El caso frecuente no es un fallo técnico: es que otro llegó antes.
       * Se dice tal cual, sin lenguaje de error, porque no ha hecho nada mal.
       */
      Alert.alert(
        'No has podido aceptarla',
        error instanceof ApiError
          ? error.message
          : 'Revisa tu conexión e inténtalo de nuevo.',
      )
    },
  })

  const start = useMutation({
    mutationFn: (jobId: string) => urgenciesApi.start(jobId),
    onSuccess: invalidate,
    onError: () => {
      Alert.alert(
        'No hemos podido marcarla como empezada',
        'Revisa tu conexión e inténtalo de nuevo.',
      )
    },
  })

  const finish = useMutation({
    mutationFn: (jobId: string) => urgenciesApi.finish(jobId),
    onSuccess: invalidate,
    onError: () => {
      Alert.alert(
        'No hemos podido cerrarla',
        'Revisa tu conexión e inténtalo de nuevo.',
      )
    },
  })

  return {
    accept: async (jobId: string): Promise<AcceptedUrgency | null> => {
      try {
        return await accept.mutateAsync(jobId)
      } catch {
        return null
      }
    },
    start: async (jobId: string): Promise<boolean> => {
      try {
        await start.mutateAsync(jobId)
        return true
      } catch {
        return false
      }
    },
    finish: async (jobId: string): Promise<boolean> => {
      try {
        await finish.mutateAsync(jobId)
        return true
      } catch {
        return false
      }
    },
    isAccepting: accept.isPending,
    isStarting: start.isPending,
    isFinishing: finish.isPending,
  }
}
