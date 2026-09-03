/**
 * useRequestPro
 * El cliente le pide presupuesto a un profesional concreto del directorio,
 * que es **contratarle una visita**: se retiene lo que cobra por presentarse y
 * se le paga cuando acepta.
 *
 * Al enviarlo se invalida la lista de trabajos: el encargo aparece ahí como
 * uno más, esperando respuesta, y es donde el cliente va a mirar si le han
 * contestado.
 *
 * **Con fotos** (20 Agosto 2026). Antes no las admitía, y eso dejaba al
 * encargo directo corto justo en lo que más decide: en oficios se valora
 * mirando, y el profesional que recibe un encargo sin fotos tiene que
 * preguntar por chat lo que se ve en un vistazo.
 *
 * **Con dinero** (3 Septiembre 2026). Era el camino gratis abierto a todo el
 * directorio: creaba el encargo y nada más. Ahora pasa por el mismo sitio que
 * la carta y las horas, con su retención y su 3D Secure
 * (`useCardChallenge`).
 *
 * ## El orden importa: primero el dinero, después las fotos
 *
 * Las fotos se suben **una vez que el encargo existe** —necesitan su id— y por
 * eso van después. Si una no llega, el encargo sigue en pie y se le dice
 * cuántas faltan: perder una foto no puede deshacer una retención hecha, y
 * volver a empezar le cobraría dos veces la misma visita.
 */

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ApiError, NetworkError } from '@/api'
import { uploadApi } from '@/api/upload.api'
import type { PickedImage } from '@/hooks/media/usePickImage'
import { useAuthStore } from '@/stores/useAuthStore'
import {
  assignmentsApi,
  type ApiDirectRequest,
  type RequestProPayload,
} from '@/api/assignments.api'
import type { FieldErrors } from '@/utils/formErrors'
import { useIdentityGate } from './useIdentityGate'
import { CardAuthError, useCardChallenge } from './useCardChallenge'

export interface RequestOutcome {
  request: ApiDirectRequest
  /** Cuántas fotos no llegaron. El encargo se hace igual */
  photosFailed: number
}

export function useRequestPro(proId: string | undefined) {
  const queryClient = useQueryClient()
  const [isUploadingPhotos, setIsUploadingPhotos] = useState(false)

  const identityGate = useIdentityGate()
  const resolveCardChallenge = useCardChallenge()

  const mutation = useMutation({
    mutationFn: async (payload: RequestProPayload): Promise<ApiDirectRequest> => {
      const sent = await assignmentsApi.request(proId as string, payload)

      if (sent.outcome === 'sent') return sent

      /*
        El banco pide autenticación. El encargo espera en borrador —no lo ve
        nadie, ningún reloj corre— hasta que se resuelva el reto; el servidor
        es quien dice si de verdad salió. Del resultado solo se toma el cobro:
        los nombres y el oficio ya venían en la primera respuesta y son los
        mismos.
      */
      const confirmed = await resolveCardChallenge(sent.id, sent.clientSecret)

      return { ...sent, outcome: 'sent', charge: confirmed.charge, clientSecret: null }
    },

    /*
     * Falta el documento: no es un fallo, es una puerta con salida. El aviso
     * lo pone el gate, con el botón que lleva a subirlo.
     */
    onError: (error) => {
      identityGate(error)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['jobs'] })
    },
  })

  const error = mutation.error

  return {
    request: async (
      payload: RequestProPayload,
      photos: PickedImage[] = [],
    ): Promise<RequestOutcome | null> => {
      let request: ApiDirectRequest

      try {
        request = await mutation.mutateAsync(payload)
      } catch {
        return null
      }

      // A partir de aquí el encargo EXISTE y la visita está retenida: nada de
      // lo que siga puede devolver null, sería mentirle al cliente sobre lo
      // que ha pasado con su dinero.
      let photosFailed = 0

      if (photos.length > 0) {
        setIsUploadingPhotos(true)
        const accessToken = useAuthStore.getState().accessToken

        if (accessToken) {
          /*
            En serie: el servidor las numera por orden de llegada, y en
            paralelo el orden que ve el profesional no sería el que eligió el
            cliente.
          */
          for (const photo of photos) {
            try {
              await uploadApi.jobPhoto(request.id, photo, accessToken)
            } catch {
              photosFailed += 1
            }
          }
        } else {
          photosFailed = photos.length
        }

        setIsUploadingPhotos(false)
      }

      return { request, photosFailed }
    },
    isRequesting: mutation.isPending || isUploadingPhotos,
    fieldErrors:
      error instanceof ApiError
        ? error.toFieldErrors<RequestProPayload>()
        : ({} as FieldErrors<RequestProPayload>),
    /**
     * El mensaje suelto: un oficio que no ejerce, un profesional que ya no
     * está, un oficio sin precios, la tarjeta rechazada o la autenticación que
     * no salió no son errores de un campo del formulario, son motivos por los
     * que este encargo concreto no puede salir.
     */
    formError:
      error instanceof NetworkError || error instanceof CardAuthError
        ? error.message
        : error instanceof ApiError && error.details.length === 0
          ? error.message
          : null,
    reset: () => mutation.reset(),
  }
}
