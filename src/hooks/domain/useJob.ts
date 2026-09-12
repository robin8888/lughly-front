/**
 * useJob
 * La ficha completa de un trabajo.
 *
 * Sirve a los dos lados: el servidor decide qué enseña según quién pregunte,
 * así que aquí no hay dos hooks ni dos rutas.
 */

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ApiError, NetworkError } from '@/api'
import { jobsApi, type ApiJobDetail } from '@/api/jobs.api'
import { assignmentsApi } from '@/api/assignments.api'
import { uploadApi } from '@/api/upload.api'
import type { PickedImage } from '@/hooks/media/usePickImage'
import { useAuthStore } from '@/stores/useAuthStore'

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
 * Acordar otra hora para un trabajo que no empezó a la suya
 * (`CICLOS_DE_CONTRATACION.md` §A9).
 *
 * Dos pasos y no uno: propone uno y acepta el otro. Escribir la hora nueva de
 * un solo toque sería moverle la mañana al de enfrente sin su sí.
 *
 * Refresca la ficha y la agenda: la cita cambia de hora, y la agenda del
 * profesional la enseña donde estaba.
 */
export function useReschedule() {
  const queryClient = useQueryClient()

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ['jobs'] })
    void queryClient.invalidateQueries({ queryKey: ['pro', 'agenda'] })
  }

  const propose = useMutation({
    mutationFn: ({ jobId, scheduledAt }: { jobId: string; scheduledAt: string }) =>
      jobsApi.proposeTime(jobId, scheduledAt),
    onSuccess: refresh,
  })

  const accept = useMutation({
    mutationFn: (jobId: string) => jobsApi.acceptTime(jobId),
    onSuccess: refresh,
  })

  return {
    proposeTime: async (jobId: string, scheduledAt: Date) => {
      try {
        const result = await propose.mutateAsync({
          jobId,
          scheduledAt: scheduledAt.toISOString(),
        })

        return { ok: true as const, result, error: null }
      } catch (error) {
        return { ok: false as const, result: null, error: mensajeDe(error) }
      }
    },
    acceptTime: async (jobId: string) => {
      try {
        return { ok: true as const, result: await accept.mutateAsync(jobId), error: null }
      } catch (error) {
        return { ok: false as const, result: null, error: mensajeDe(error) }
      }
    },
    isRescheduling: propose.isPending || accept.isPending,
  }
}

/**
 * Saltarse una sesión de un contrato fijo, sin romperlo
 * (`CICLOS_DE_CONTRATACION.md` §F7).
 *
 * Aparte de `useCancelContract` y no un parámetro suyo, por lo mismo que en el
 * servidor: aquella se lleva el acuerdo entero y sus dieciocho mañanas, y esta
 * el miércoles que viene. Un solo botón con un interruptor dejaría que un
 * dedazo cancelara un contrato de meses.
 *
 * Refresca lo mismo: la ficha, la agenda —a alguien se le acaba de caer una
 * mañana— y la bandeja.
 */
export function useCancelSession() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: ({
      jobId,
      sessionId,
      reason,
    }: {
      jobId: string
      sessionId: string
      reason?: string
    }) => jobsApi.cancelSession(jobId, sessionId, reason),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['jobs'] })
      void queryClient.invalidateQueries({ queryKey: ['pro', 'agenda'] })
      void queryClient.invalidateQueries({ queryKey: ['pro', 'inbox'] })
    },
  })

  return {
    cancelSession: async (jobId: string, sessionId: string, reason?: string) => {
      try {
        const result = await mutation.mutateAsync({ jobId, sessionId, reason })
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
    mutationFn: ({ jobId, chargeExtra }: { jobId: string; chargeExtra: boolean }) =>
      assignmentsApi.finish(jobId, chargeExtra),
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
    /**
     * Terminar, con las fotos de cómo ha quedado si las hay.
     *
     * **Las fotos primero.** El cliente recibe el aviso de "ha terminado" en el
     * momento en que se llama a `finish`, y lo que hace con él es abrir el
     * trabajo a mirar cómo quedó: si las fotos fueran después, se encontraría
     * una galería vacía y tendría que volver.
     *
     * Y si alguna no sube, se termina igual. Perder una foto no puede impedir
     * cerrar un trabajo hecho —quien está en un portal con mala cobertura no
     * puede quedarse sin poder marcar que ha acabado—; se dice cuántas
     * faltaron y se pueden añadir mientras el cliente no lo dé por bueno.
     */
    finish: async (
      jobId: string,
      photos: PickedImage[] = [],
      /** Si cobra el rato de más, cuando lo haya (`CICLOS` §A6) */
      chargeExtra = false,
    ) => {
      let photosFailed = 0

      if (photos.length > 0) {
        const accessToken = useAuthStore.getState().accessToken

        if (accessToken) {
          /*
            En serie: el servidor las numera por orden de llegada, y en paralelo
            el orden que ve el cliente no sería el que eligió quien las hizo.
          */
          for (const photo of photos) {
            try {
              await uploadApi.jobResultPhoto(jobId, photo, accessToken)
            } catch {
              photosFailed += 1
            }
          }
        } else {
          photosFailed = photos.length
        }
      }

      try {
        return {
          ok: true as const,
          error: null,
          result: await finish.mutateAsync({ jobId, chargeExtra }),
          photosFailed,
        }
      } catch (error) {
        return {
          ok: false as const,
          result: null,
          error: mensajeDe(error),
          photosFailed,
        }
      }
    },
    isStarting: start.isPending,
    isFinishing: finish.isPending,
  }
}

/**
 * El cliente dice **por qué no** da por bueno un trabajo terminado.
 *
 * Apaga el cierre por silencio —el que a las 24 horas cierra y paga— y le
 * manda el motivo al profesional. No cierra ninguna puerta: dar por bueno sigue
 * disponible en todo momento, y en cuanto se pulse el dinero sale.
 */
export function useHoldJob() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: ({ jobId, reason }: { jobId: string; reason: string }) =>
      jobsApi.hold(jobId, reason),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['jobs'] })
    },
  })

  return {
    hold: async (jobId: string, reason: string) => {
      try {
        return {
          ok: true as const,
          error: null,
          result: await mutation.mutateAsync({ jobId, reason }),
        }
      } catch (error) {
        return { ok: false as const, result: null, error: mensajeDe(error) }
      }
    },
    isHolding: mutation.isPending,
  }
}

/**
 * El cliente valora el trabajo que acaba de dar por bueno.
 *
 * Se pide justo ahí y no en otra pantalla porque es el único momento en que
 * alguien se acuerda de cómo fue: al día siguiente ya nadie entra a valorar,
 * y un profesional sin valoraciones no se distingue de uno malo en el
 * directorio.
 *
 * Al terminar se invalida también la ficha del profesional: su media y su
 * número de valoraciones acaban de cambiar.
 */
export function useReviewJob() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: ({
      jobId,
      rating,
      comment,
    }: {
      jobId: string
      rating: number
      comment: string | null
    }) => jobsApi.review(jobId, rating, comment),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['pros'] })
    },
  })

  return {
    review: async (jobId: string, rating: number, comment: string | null) => {
      try {
        return {
          ok: true as const,
          error: null,
          result: await mutation.mutateAsync({ jobId, rating, comment }),
        }
      } catch (error) {
        return { ok: false as const, result: null, error: mensajeDe(error) }
      }
    },
    isReviewing: mutation.isPending,
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
      /*
        La ficha del profesional entera, por prefijo: cerrar un trabajo le sube
        la cuenta de trabajos terminados, y esa vive en `['pro', id]`. Con
        `['pro', 'assignments']` a secas no caía, porque React Query invalida
        por prefijo y aquel es otro.
      */
      void queryClient.invalidateQueries({ queryKey: ['pro'] })
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
export function mensajeDe(error: unknown): string | null {
  return error instanceof NetworkError || error instanceof ApiError ? error.message : null
}

/**
 * El profesional emite el presupuesto tras ver el trabajo (`CICLOS` §C5).
 *
 * Cada emisión es una versión nueva y la anterior queda marcada: reemitir
 * después de un rechazo es el camino normal, no un caso raro. Por eso el hook
 * no distingue "crear" de "corregir" — el servidor lleva la cuenta.
 *
 * Se invalida todo lo de trabajos: el estado pasa a `QUOTED` y eso cambia la
 * tarjeta de Mis trabajos, la bandeja y la ficha a la vez.
 */
export function useCreateQuote() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: ({
      jobId,
      payload,
    }: {
      jobId: string
      payload: Parameters<typeof jobsApi.createQuote>[1]
    }) => jobsApi.createQuote(jobId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['jobs'] })
    },
  })

  return {
    createQuote: async (
      jobId: string,
      payload: Parameters<typeof jobsApi.createQuote>[1],
    ) => {
      try {
        return {
          ok: true as const,
          error: null,
          result: await mutation.mutateAsync({ jobId, payload }),
        }
      } catch (error) {
        return { ok: false as const, result: null, error: mensajeDe(error) }
      }
    },
    isQuoting: mutation.isPending,
  }
}

/**
 * El cliente dice que no, con el motivo.
 *
 * **No cierra el trabajo**: queda esperando otra versión quince días. Y el
 * motivo se exige, porque es lo único que le dice al profesional qué cambiar
 * —un "no" a secas convierte reemitir en adivinar—.
 */
export function useRejectQuote() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: ({ jobId, reason }: { jobId: string; reason: string }) =>
      jobsApi.rejectQuote(jobId, reason),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['jobs'] })
    },
  })

  return {
    rejectQuote: async (jobId: string, reason: string) => {
      try {
        return {
          ok: true as const,
          error: null,
          result: await mutation.mutateAsync({ jobId, reason }),
        }
      } catch (error) {
        return { ok: false as const, result: null, error: mensajeDe(error) }
      }
    },
    isRejecting: mutation.isPending,
  }
}

/**
 * El cliente acepta el presupuesto (`CICLOS` §C6).
 *
 * **Ya no cobra nada.** Desde el 12 de septiembre de 2026 el arreglo se lo paga
 * el cliente al profesional directamente: por la app van la visita, las horas,
 * la carta y las urgencias —que venden tiempo comprobable— y no el presupuesto,
 * que vende un resultado y con importes diez veces mayores.
 *
 * Por eso aquí no hay tarjeta ni reto del banco: aceptar es firmar un acuerdo,
 * y lo que devuelve es lo acordado, no lo retenido.
 */
export function useAcceptQuote() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (jobId: string) => jobsApi.acceptQuote(jobId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['jobs'] })
    },
  })

  return {
    acceptQuote: async (jobId: string) => {
      try {
        return { ok: true as const, error: null, result: await mutation.mutateAsync(jobId) }
      } catch (error) {
        return { ok: false as const, result: null, error: mensajeDe(error) }
      }
    },
    isAccepting: mutation.isPending,
  }
}
/**
 * «He vuelto y ya está arreglado», del lado profesional (`CICLOS` §C9).
 *
 * Es la salida que no existía: hasta el 12 de septiembre de 2026, un reparo del
 * cliente dejaba al profesional sin ningún botón y el dinero retenido hasta que
 * el cliente pulsara «doy por bueno» —que podía no pulsar nunca—.
 */
export function useMarkFixed() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (jobId: string) => jobsApi.markFixed(jobId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['jobs'] })
      void queryClient.invalidateQueries({ queryKey: ['pro', 'assignments'] })
      void queryClient.invalidateQueries({ queryKey: ['pro', 'agenda'] })
    },
  })

  return {
    markFixed: async (jobId: string) => {
      try {
        return { ok: true as const, error: null, result: await mutation.mutateAsync(jobId) }
      } catch (error) {
        return { ok: false as const, result: null, error: mensajeDe(error) }
      }
    },
    isMarkingFixed: mutation.isPending,
  }
}

/**
 * «Que lo revise alguien» (`CICLOS` §C9), de cualquiera de los dos lados.
 *
 * Se manda **con las pruebas primero**, si las hay: quien abre una revisión
 * está contando algo, y las fotos son la mitad de lo que cuenta. Llegando
 * después, el aviso que reciben el otro y administración sale sin ellas.
 *
 * Si ninguna sube, se abre igual. Lo que no puede pasar es que una foto perdida
 * en un portal sin cobertura deje a alguien sin poder pedir que le revisen su
 * dinero; se dice cuántas faltaron y se pueden añadir después.
 */
export function useOpenDispute() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: ({ jobId, reason }: { jobId: string; reason: string }) =>
      jobsApi.openDispute(jobId, reason),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['jobs'] })
      void queryClient.invalidateQueries({ queryKey: ['pro', 'assignments'] })
    },
  })

  return {
    openDispute: async (jobId: string, reason: string, pruebas: PickedImage[] = []) => {
      const photosFailed = await subirPruebas(jobId, pruebas)

      try {
        return {
          ok: true as const,
          error: null,
          photosFailed,
          result: await mutation.mutateAsync({ jobId, reason }),
        }
      } catch (error) {
        return { ok: false as const, result: null, photosFailed, error: mensajeDe(error) }
      }
    },
    isOpeningDispute: mutation.isPending,
  }
}

/**
 * Aportar pruebas a algo ya abierto (`CICLOS` §C9).
 *
 * Se pueden añadir mientras la revisión siga sin resolver: una discusión no
 * termina de contarse de una vez, y el otro lado puede aportar algo que obligue
 * a enseñar otra cosa.
 */
export function useAddEvidence() {
  const queryClient = useQueryClient()
  const [isAdding, setIsAdding] = useState(false)

  return {
    addEvidence: async (jobId: string, pruebas: PickedImage[], note?: string) => {
      setIsAdding(true)

      try {
        const photosFailed = await subirPruebas(jobId, pruebas, note)

        void queryClient.invalidateQueries({ queryKey: ['jobs'] })

        if (photosFailed === pruebas.length && pruebas.length > 0) {
          return {
            ok: false as const,
            photosFailed,
            error: 'No hemos podido subirlas. Mira la cobertura y vuelve a intentarlo.',
          }
        }

        return { ok: true as const, photosFailed, error: null }
      } finally {
        setIsAdding(false)
      }
    },
    isAddingEvidence: isAdding,
  }
}

/**
 * Las pruebas, de una en una y en orden, con su nota.
 *
 * En serie como las demás fotos: el expediente se lee por fecha, y en paralelo
 * el orden que ve quien decide no sería el que eligió quien las aporta.
 * Devuelve cuántas se han quedado por el camino.
 */
async function subirPruebas(
  jobId: string,
  pruebas: PickedImage[],
  note?: string,
): Promise<number> {
  if (pruebas.length === 0) return 0

  const accessToken = useAuthStore.getState().accessToken

  if (!accessToken) return pruebas.length

  let fallidas = 0

  for (const prueba of pruebas) {
    try {
      await uploadApi.jobEvidence(jobId, prueba, accessToken, note)
    } catch {
      fallidas += 1
    }
  }

  return fallidas
}
