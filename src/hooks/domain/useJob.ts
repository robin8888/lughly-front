/**
 * useJob
 * La ficha completa de un trabajo.
 *
 * Sirve a los dos lados: el servidor decide qué enseña según quién pregunte,
 * así que aquí no hay dos hooks ni dos rutas.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ApiError, NetworkError } from '@/api'
import { jobsApi, type ApiJobDetail } from '@/api/jobs.api'
import { assignmentsApi } from '@/api/assignments.api'

export function jobQueryKey(jobId: string) {
  return ['jobs', 'detail', jobId] as const
}

export function useJob(jobId: string | undefined) {
  return useQuery<ApiJobDetail>({
    queryKey: jobQueryKey(jobId ?? ''),
    queryFn: () => jobsApi.detail(jobId as string),
    // Sin id no se pide nada: Expo Router entrega los parámetros de la ruta
    // en el segundo render, y el primero llegaría aquí con `undefined`.
    enabled: Boolean(jobId),
    /**
     * Corto: es la pantalla donde se mira si ya han contestado, y volver a
     * ella para ver lo mismo de hace diez minutos es justo lo que no se
     * espera.
     */
    staleTime: 15_000,
  })
}

/**
 * Cancelar un trabajo propio.
 *
 * Al cancelar cambian su ficha y la lista: se refresca todo lo de trabajos en
 * vez de ir campo a campo.
 */
export function useCancelJob() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (jobId: string) => jobsApi.cancel(jobId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['jobs'] })
    },
  })

  return {
    cancel: async (jobId: string) => {
      try {
        await mutation.mutateAsync(jobId)
        return { ok: true as const, error: null }
      } catch (error) {
        return {
          ok: false as const,
          error:
            error instanceof NetworkError || error instanceof ApiError
              ? error.message
              : null,
        }
      }
    },
    isCancelling: mutation.isPending,
  }
}

/**
 * Romper un trabajo ya contratado, con su motivo.
 *
 * Aparte de `useCancelJob` porque son dos cosas distintas: aquello es retirar
 * un anuncio que nadie ha tocado, y esto es decirle a alguien que había
 * apartado la mañana que ya no hace falta que venga. Por eso pide motivo, y
 * por eso lo pueden usar los dos lados.
 */
export function useCancelContract() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: ({ jobId, reason }: { jobId: string; reason: string }) =>
      jobsApi.cancelContract(jobId, reason),
    onSuccess: () => {
      /*
        Y la agenda con ellos: al profesional se le acaba de caer una visita, y
        dejarla en su día sería enseñarle algo a lo que ya no tiene que ir.
      */
      void queryClient.invalidateQueries({ queryKey: ['jobs'] })
      void queryClient.invalidateQueries({ queryKey: ['pro', 'agenda'] })
      void queryClient.invalidateQueries({ queryKey: ['pro', 'inbox'] })
    },
  })

  return {
    cancelContract: async (jobId: string, reason: string) => {
      try {
        const result = await mutation.mutateAsync({ jobId, reason })
        return { ok: true as const, result, error: null }
      } catch (error) {
        return {
          ok: false as const,
          result: null,
          error:
            error instanceof NetworkError || error instanceof ApiError
              ? error.message
              : null,
        }
      }
    },
    isCancelling: mutation.isPending,
  }
}

/**
 * Volver a encargar un trabajo a otro profesional, **retiniendo su visita**.
 *
 * Cambia su ficha y su sitio en la lista —vuelve a estar esperando respuesta—,
 * así que se refresca todo lo de trabajos.
 *
 * La tarjeta es obligatoria desde el 3 de septiembre de 2026: el precio de una
 * visita es de quien la hace, así que al cambiar de profesional se suelta lo
 * del anterior y se retiene lo del nuevo. `result.amount` dice cuánto ha sido,
 * y es lo que hay que enseñarle al cliente: no tiene por qué ser lo mismo que
 * pagó la primera vez.
 */
export function useReassignJob() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: ({
      jobId,
      proId,
      paymentMethodId,
    }: {
      jobId: string
      proId: string
      paymentMethodId: string
    }) => jobsApi.reassign(jobId, proId, paymentMethodId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['jobs'] })
    },
  })

  return {
    reassign: async (jobId: string, proId: string, paymentMethodId: string) => {
      try {
        return {
          ok: true as const,
          result: await mutation.mutateAsync({ jobId, proId, paymentMethodId }),
          error: null,
        }
      } catch (error) {
        return {
          ok: false as const,
          result: null,
          error:
            error instanceof NetworkError || error instanceof ApiError
              ? error.message
              : null,
        }
      }
    },
    isReassigning: mutation.isPending,
  }
}

/**
 * Los dos pasos del día del trabajo, para quien lo hace: empezar y terminar.
 *
 * Se invalidan también la agenda y la bandeja porque el mismo trabajo se pinta
 * en las tres pantallas por su estado: dejar una sin refrescar la deja
 * enseñando "por hacer" algo que se acaba de terminar.
 *
 * Terminar **no cobra**: abre el plazo de 24 horas que tiene el cliente para
 * decir que no fue así. Quien lo cierra —y suelta el dinero— es
 * `useCompleteJob`, o el plazo si el cliente no dice nada.
 */
export function useJobProgress() {
  const queryClient = useQueryClient()

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['jobs'] })
    void queryClient.invalidateQueries({ queryKey: ['pro', 'assignments'] })
    void queryClient.invalidateQueries({ queryKey: ['pro', 'agenda'] })
  }

  const start = useMutation({
    mutationFn: (jobId: string) => assignmentsApi.start(jobId),
    onSuccess: invalidate,
  })

  const finish = useMutation({
    mutationFn: (jobId: string) => assignmentsApi.finish(jobId),
    onSuccess: invalidate,
  })

  return {
    start: async (jobId: string) => {
      try {
        return { ok: true as const, error: null, result: await start.mutateAsync(jobId) }
      } catch (error) {
        return { ok: false as const, result: null, error: mensajeDe(error) }
      }
    },
    finish: async (jobId: string) => {
      try {
        return { ok: true as const, error: null, result: await finish.mutateAsync(jobId) }
      } catch (error) {
        return { ok: false as const, result: null, error: mensajeDe(error) }
      }
    },
    isStarting: start.isPending,
    isFinishing: finish.isPending,
  }
}

/**
 * El cliente da por bueno un trabajo terminado.
 *
 * Es lo que suelta el dinero: lo contratado desde la carta se retiene al
 * reservar, se cobra cuando el profesional acepta, y se queda en la
 * plataforma hasta que alguien cierra el trabajo. Si el cliente no pulsa nada, el servidor lo da por bueno a las 24
 * horas — este botón es para no esperarlas.
 *
 * Refresca también la agenda del profesional por si quien mira es una empresa
 * con las dos caras abiertas en el mismo móvil.
 */
export function useCompleteJob() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (jobId: string) => jobsApi.complete(jobId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['jobs'] })
      void queryClient.invalidateQueries({ queryKey: ['pro', 'assignments'] })
    },
  })

  return {
    complete: async (jobId: string) => {
      try {
        return { ok: true as const, result: await mutation.mutateAsync(jobId), error: null }
      } catch (error) {
        return { ok: false as const, result: null, error: mensajeDe(error) }
      }
    },
    isCompleting: mutation.isPending,
  }
}

/**
 * El cliente reconoce que el trabajo ha empezado.
 *
 * No arranca nada: el reloj corre desde que el profesional pulsó Empezar. Lo
 * que hace es que a él le llegue que del otro lado se han enterado, y que
 * quede constancia de las dos versiones si algún día se discute la hora.
 */
export function useApproveStart() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (jobId: string) => jobsApi.approveStart(jobId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['jobs'] })
    },
  })

  return {
    approveStart: async (jobId: string) => {
      try {
        return { ok: true as const, result: await mutation.mutateAsync(jobId), error: null }
      } catch (error) {
        return { ok: false as const, result: null, error: mensajeDe(error) }
      }
    },
    isApproving: mutation.isPending,
  }
}

/** Lo que se le puede enseñar a alguien de un fallo, si es que se puede algo */
function mensajeDe(error: unknown): string | null {
  return error instanceof NetworkError || error instanceof ApiError ? error.message : null
}
